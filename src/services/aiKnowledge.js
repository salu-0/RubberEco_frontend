// Local knowledge base for RubberEco AI
// Focus: Government Subsidies and Support for Rubber Farmers in Kerala

// Simple keyword-based router (broad to catch scheme-related intents)
function isSchemesQuery(q) {
  if (!q) return false;
  const text = q.toLowerCase();
  const keywords = [
    'scheme', 'schemes', 'subsid', 'support', 'grant', 'incentive',
    'kerala', 'rpis', 'rubber board', 'plantation development',
    'insurance', 'export bonus', 'price support', 'msp', 'crop insurance',
    'nirt', 'training', 'rps', 'rubber producers’ society', "rubber producers' society"
  ];
  return keywords.some(k => text.includes(k));
}

// Canonical, curated answer for Kerala schemes (provided by user)
const SCHEMES_KERALA_ANSWER = `Government Subsidies and Support for Rubber Farmers in Kerala

Direct Income Support
- Kerala Rubber Production Incentive Scheme (RPIS): Kerala guarantees a floor price (currently ₹180/kg of RSS 4) and pays growers the difference between this support price and the actual market price [newindianexpress.com]. Farmers register with their local Rubber Producers’ Society (RPS), submit dealer-sale receipts, and the subsidy is disbursed via the state e-payment portal [newindianexpress.com]. In 2024 the state budget allocated ₹24.48 crore to clear RPIS dues, benefiting about 1.5 lakh small and marginal growers [newindianexpress.com].
- Export Incentive (Rubber Board): The central Rubber Board offers an export bonus of ₹5 per kg on RSS (to promote exports) [newindianexpress.com]. This payment is made directly to registered rubber exporters of Kerala as an incentive.

Price Support (MSP/Procurement)
- MSP: Natural rubber is not included under India’s MSP scheme [pib.gov.in]. (The Ministry of Agriculture notes that rubber is not treated as an agrarian product for MSP purposes [pib.gov.in].) Consequently there is no procurement MSP by the central government. Instead, Kerala’s RPIS effectively provides a price floor by compensating the gap up to ₹180/kg [newindianexpress.com].
- State Procurement: The Kerala government does not run a direct procurement program for rubber; instead it relies on the RPIS subsidy and market measures to stabilize farmer prices.

Input Subsidies (Planting, Fertilizer, Irrigation)
- Plantation Development Subsidy (Central Scheme): Under the Rubber Board’s Plantation Development scheme, smallholders in Kerala receive large subsidies for expanding or renewing rubber. For traditional areas (Kerala), the assistance was recently raised to ₹40,000 per hectare for new planting [pib.gov.in]. In addition, certified rubber planting material (seedlings) worth about ₹50,000 per hectare is supplied/reimbursed by the Rubber Board to growers [pib.gov.in]. (SC growers in non-traditional areas get an even higher planting subsidy of ₹200,000/ha [pib.gov.in].) These subsidies are paid on submission of prescribed application forms and plantation sketches to the Board [rubberboard.org.in].
- Rain-Guarding and Spraying (Central Scheme): To protect yields from Kerala’s heavy rains, the Rubber Board subsidizes “rain-guard” covers and spraying equipment. In 2024–26 the Board planned support for rain-protection on about 67,000 ha (including 60,000 ha in Kerala) and for plant-protection spraying on 22,000 ha [pib.gov.in]. Farmers can apply through their RPS or extension officers to get these covers installed.
- General Fertilizer/Irrigation Subsidies: Rubber farmers can also avail the normal state/national subsidies on inputs (e.g. subsidized fertilizers, pesticides or micro-irrigation systems) under Kerala’s agricultural subsidy schemes, though there is no special fertilizer or irrigation scheme only for rubber beyond the above (rain-guarding) assistance.

Insurance Schemes
- Kerala Crop Insurance Scheme: Kerala’s crop insurance (formerly the Weather-Based scheme, now integrated under the state scheme) covers rubber as a perennial plantation crop [keralaagriculture.gov.in]. Growers insure their rubber before tapping begins via the AIMS online portal through the local Krishi Bhavan [keralaagriculture.gov.in]. In case of yield loss from drought, extreme weather, pests etc., farmers file claims through the portal and receive payouts as per the policy. (The state pays part of the insurance premium to keep farmers’ cost low [keralaagriculture.gov.in].)
- Rubber Board – Plantation Worker Insurance: The Rubber Board runs an insurance plan for rubber tappers and small self-tapping growers (holding up to 1 ha). Eligible beneficiaries (age 18–59 with ≥1 year tapping experience) pay a minimal premium (₹300; the Board tops it up with ₹900) for coverage [tyre-trends.com]. Benefits include ₹1 lakh for natural death, ₹5 lakh for accidental/wild-animal death, and ₹2–4 lakh for disability [tyre-trends.com]. Applications (and renewals) are handled through the Board’s regional offices or the Labour Welfare Division [tyre-trends.com].
- Other Insurance: Keralites can also opt for the national PMFBY crop-insurance scheme where available (rubber was included in Kerala’s notified list in 2023), and the central Government’s Vehicle and Life insurance schemes (like PM Suraksha) are open to farmers generally. But the above state/corporate schemes are the ones specifically tailored to rubber growers.

Technical Assistance, Training and Extension
- Rubber Board Training (NIRT): The Rubber Board’s National Institute for Rubber Training (NIRT) in Kerala (Kottayam) offers regular courses for growers and estate managers. For example, in 2025 NIRT ran short-term rubber-cultivation courses (in Malayalam) specifically for small growers [training.rubberboard.org.in]. Certification programs and workshops cover improved tapping, fertilization, nursery management, etc. Farmers (and members of RPS groups) can enroll in these paid courses or workshops via the Board’s website.
- Extension Services: Kerala’s Agriculture Department and Rubber Board jointly provide on-field advisory. Rubber Board officers and Scientists conduct farm visits, demo plots and Kisan Melas (farmer meets) in rubber areas. The Board also releases technical bulletins in Malayalam on best practices. Moreover, the Board is rolling out digital tools – for example, a mobile app and geo-tagging drones – to quickly share weather forecasts, pest alerts and price information with growers [pib.gov.in].
- Local Outreach: Local bodies (Krishi Bhavans and RPSs) play a big role. Many Kerala panchayats have appointed “rubber Krishi Sakhis” who advise farmers. District Rubber Committees fund extension camps and assistants. (Farmers should contact their Rubber Board field office or local agronomist for the latest schedules of technical training and advisory camps.)

Support for Smallholders
- Rubber Producers’ Societies (RPS): The Rubber Board actively promotes RPS groups (clusters of 50–200 small growers) to strengthen grassroots support. Under the national rubber scheme, about 250 new RPSs are supported yearly; each society gets an annual grant (now ₹5,000 per RPS) to organize training, group meetings or purchase basic equipment [pib.gov.in]. RPS membership gives small farmers collective purchasing power for inputs and better bargaining in selling latex.
- High-Rate Subsidies (SC/ST Farmers): Certain higher subsidies target marginal cultivators. For example, Scheduled Caste rubber growers planting in non-traditional areas get ₹2,00,000 per ha (vs. ₹40,000 normally) as a special grant [pib.gov.in]. Kerala’s welfare programs similarly favor small tribal rubber holders (through schemes like tribal rubber plantation projects), ensuring they benefit from the above supports.
- Other Smallholder Welfare: Many ancillary schemes aid smallholder well-being. Kerala and the Rubber Board offer housing grants, educational stipends and pension benefits to plantation workers’ families [pib.gov.in].

How to Apply / Who to Contact
- First stop: your local Rubber Producers’ Society (RPS) or Rubber Board field office.
- Online portals: Kerala e-payment/AIMS (for subsidies/insurance); Rubber Board portals for training and planting support.

Note: Program amounts and eligibility can change. Always confirm the latest circulars from Kerala Agriculture Department and the Rubber Board before applying.`;

export function getSchemeAnswer(query) {
  return isSchemesQuery(query) ? SCHEMES_KERALA_ANSWER : null;
}

export function getSchemeContext(query) {
  // Returns context for LLM prompting when we still want AI phrasing
  return isSchemesQuery(query) ? SCHEMES_KERALA_ANSWER : '';
}

export { isSchemesQuery };