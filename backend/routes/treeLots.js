const express = require('express');
const router = express.Router();
// Note: TreeLot and Bid models need to be created
// const TreeLot = require('../models/TreeLot');
// const Bid = require('../models/Bid');
const { protect, authorize } = require('../middlewares/auth');

// @route   GET /api/tree-lots
// @desc    Get all active tree lots for bidding
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      minPrice, 
      maxPrice, 
      location, 
      minTrees, 
      sortBy = 'newest',
      page = 1,
      limit = 10 
    } = req.query;

    // Build query
    let query = { status: 'active', biddingEndDate: { $gt: new Date() } };

    // Search filter
    if (search) {
      query.$or = [
        { 'farmerInfo.name': { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { lotId: { $regex: search, $options: 'i' } }
      ];
    }

    // Price filters
    if (minPrice) query.minimumPrice = { ...query.minimumPrice, $gte: parseInt(minPrice) };
    if (maxPrice) query.minimumPrice = { ...query.minimumPrice, $lte: parseInt(maxPrice) };

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Trees count filter
    if (minTrees) {
      query.numberOfTrees = { $gte: parseInt(minTrees) };
    }

    // Sorting
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'priceHigh':
        sortOptions = { minimumPrice: -1 };
        break;
      case 'priceLow':
        sortOptions = { minimumPrice: 1 };
        break;
      case 'trees':
        sortOptions = { numberOfTrees: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const treeLots = await TreeLot.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('farmerId', 'name email')
      .lean();

    // Get current highest bid for each lot
    const lotsWithBids = await Promise.all(
      treeLots.map(async (lot) => {
        const highestBid = await Bid.findOne({ 
          lotId: lot._id, 
          status: 'active' 
        }).sort({ amount: -1 });

        const bidCount = await Bid.countDocuments({ 
          lotId: lot._id, 
          status: 'active' 
        });

        return {
          ...lot,
          currentHighestBid: highestBid ? highestBid.amount : lot.minimumPrice,
          bidCount
        };
      })
    );

    const total = await TreeLot.countDocuments(query);

    res.json({
      success: true,
      data: lotsWithBids,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching tree lots:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tree lots'
    });
  }
});

// @route   GET /api/tree-lots/:id
// @desc    Get single tree lot details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const treeLot = await TreeLot.findById(req.params.id)
      .populate('farmerId', 'name email phone')
      .lean();

    if (!treeLot) {
      return res.status(404).json({
        success: false,
        message: 'Tree lot not found'
      });
    }

    // Get bidding history
    const bids = await Bid.find({ 
      lotId: req.params.id, 
      status: 'active' 
    })
    .sort({ amount: -1 })
    .populate('bidderId', 'name')
    .lean();

    // Get current highest bid
    const currentHighestBid = bids.length > 0 ? bids[0].amount : treeLot.minimumPrice;

    res.json({
      success: true,
      data: {
        ...treeLot,
        currentHighestBid,
        bidCount: bids.length,
        bids: bids.map(bid => ({
          id: bid._id,
          amount: bid.amount,
          bidderName: 'Anonymous Bidder', // Keep bidder identity private
          timestamp: bid.createdAt,
          isWinning: bid.amount === currentHighestBid
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching tree lot details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tree lot details'
    });
  }
});

// @route   POST /api/tree-lots
// @desc    Create new tree lot (Farmer only)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      location,
      numberOfTrees,
      approximateYield,
      minimumPrice,
      description,
      images,
      biddingEndDate
    } = req.body;

    // Validate required fields
    if (!location || !numberOfTrees || !approximateYield || !minimumPrice || !biddingEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Generate lot ID
    const lotCount = await TreeLot.countDocuments();
    const lotId = `RT${String(lotCount + 1).padStart(3, '0')}`;

    const treeLot = new TreeLot({
      lotId,
      farmerId: req.user.id,
      location,
      numberOfTrees: parseInt(numberOfTrees),
      approximateYield,
      minimumPrice: parseInt(minimumPrice),
      description,
      images: images || [],
      biddingEndDate: new Date(biddingEndDate),
      status: 'active'
    });

    await treeLot.save();

    res.status(201).json({
      success: true,
      message: 'Tree lot created successfully',
      data: treeLot
    });

  } catch (error) {
    console.error('Error creating tree lot:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tree lot'
    });
  }
});

// @route   PUT /api/tree-lots/:id
// @desc    Update tree lot (Farmer only)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const treeLot = await TreeLot.findById(req.params.id);

    if (!treeLot) {
      return res.status(404).json({
        success: false,
        message: 'Tree lot not found'
      });
    }

    // Check if user is the owner
    if (treeLot.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this tree lot'
      });
    }

    // Check if there are active bids
    const activeBids = await Bid.countDocuments({ 
      lotId: req.params.id, 
      status: 'active' 
    });

    if (activeBids > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update tree lot with active bids'
      });
    }

    const updatedTreeLot = await TreeLot.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Tree lot updated successfully',
      data: updatedTreeLot
    });

  } catch (error) {
    console.error('Error updating tree lot:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tree lot'
    });
  }
});

// @route   DELETE /api/tree-lots/:id
// @desc    Delete tree lot (Farmer only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const treeLot = await TreeLot.findById(req.params.id);

    if (!treeLot) {
      return res.status(404).json({
        success: false,
        message: 'Tree lot not found'
      });
    }

    // Check if user is the owner
    if (treeLot.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this tree lot'
      });
    }

    // Check if there are active bids
    const activeBids = await Bid.countDocuments({ 
      lotId: req.params.id, 
      status: 'active' 
    });

    if (activeBids > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete tree lot with active bids'
      });
    }

    await TreeLot.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Tree lot deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tree lot:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting tree lot'
    });
  }
});

module.exports = router;
