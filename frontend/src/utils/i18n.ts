export type Language = 'EN' | 'MR';

export interface TranslationDict {
  // Navigation & Brand
  appTitle: string;
  hubSubtitle: string;
  liveApmc: string;
  mspProtected: string;
  mandiPricesTab: string;
  farmerProduceTab: string;
  marketplaceTab: string;
  rfqTab: string;
  escrowContractsTab: string;
  disputesTab: string;
  switchPersona: string;
  notificationsTitle: string;
  noNotifications: string;
  
  // Farmer Portal
  farmerTitle: string;
  farmerSubtitle: string;
  fpoBadge: string;
  listNewHarvest: string;
  lotFilters: string;
  totalListedStock: string;
  safeEscrowBalance: string;
  pendingInquiries: string;
  activeHarvestLots: string;
  activeInquiries: string;
  availableQty: string;
  askingRate: string;
  moistureIndex: string;
  apmcParity: string;
  printQrTag: string;
  viewOffers: string;
  viewContract: string;
  directBuyers: string;
  mspFloorTitle: string;
  mspFloorDesc: string;
  incomingOffersTitle: string;
  noIncomingOffers: string;
  acceptOffer: string;
  counterOfferBtn: string;
  
  // New Harvest Modal
  publishBatchTitle: string;
  commodityLabel: string;
  harvestVolumeLabel: string;
  baseAskingRateLabel: string;
  qualityGradeLabel: string;
  moistureLabel: string;
  expectedDeliveryDaysLabel: string;
  storageHubLabel: string;
  publishLotBtn: string;
  cancelBtn: string;

  // Buyer Discovery
  marketplaceTitle: string;
  marketplaceSubtitle: string;
  activeLotsCount: string;
  dailyTrading: string;
  filterCommodity: string;
  filterGrade: string;
  filterVolume: string;
  filterRegion: string;
  allCommodities: string;
  openOfferNegotiate: string;
  reviewBatchSpecs: string;
  rfqConsoleTitle: string;
  totalLotWeight: string;
  lasalgaonAvg: string;
  dispatchReadiness: string;
  yourCounterBid: string;
  totalDealValue: string;
  escrowAdvanceReq: string;
  submitCounterOffer: string;
  acceptTermsSign: string;
  bidHistoryTitle: string;
  backToMarketplace: string;

  // Mandi Intelligence
  mandiIntelTitle: string;
  mandiIntelSubtitle: string;
  avgFarmgatePremium: string;
  reportingMandis: string;
  topGainerToday: string;
  searchMandiPlaceholder: string;
  marketTableMandi: string;
  marketTableCrop: string;
  marketTableModal: string;
  marketTableShift: string;
  marketTableAction: string;
  calcNetProfit: string;
  calcTitle: string;
  calcSubtitle: string;
  harvestQtyDispatch: string;
  destApmc: string;
  netInHandTransfer: string;
  lockRateBookTransport: string;
  allCropsFilter: string;

  // Escrow Hub
  escrowTitle: string;
  escrowSubtitle: string;
  activeExecutedContracts: string;
  stepSigned: string;
  stepAdvance: string;
  stepInTransit: string;
  stepSettled: string;
  stage1Advance: string;
  stage2Balance: string;
  eSignFarmer: string;
  eSignBuyer: string;
  lockAdvanceBtn: string;
  dispatchBtn: string;
  deliveredBtn: string;
  releaseFinalBtn: string;
  raiseDisputeBtn: string;

  // Dispute Portal
  disputeTitle: string;
  disputeSubtitle: string;
  fileGrievanceBtn: string;
  activeGrievanceTickets: string;
  tier1Peer: string;
  tier2Apmc: string;
  tier3State: string;
  claimedDeduction: string;
  agreedSettlement: string;
  issueRulingBtn: string;
  escalateToTier2Btn: string;
  escalateToTier3Btn: string;
}

export const translations: Record<Language, TranslationDict> = {
  EN: {
    appTitle: 'AgroConnect',
    hubSubtitle: 'Govt. of Maharashtra Agri-Tech Hub',
    liveApmc: 'LIVE APMC',
    mspProtected: 'MSP Benchmark Active & Protected',
    mandiPricesTab: 'Mandi Prices',
    farmerProduceTab: 'Farmer Produce',
    marketplaceTab: 'Marketplace',
    rfqTab: 'Bilateral RFQ',
    escrowContractsTab: 'Escrow & Contracts',
    disputesTab: 'Help & Disputes',
    switchPersona: 'Switch SIH Persona:',
    notificationsTitle: 'Live Agri-Alerts & Activity',
    noNotifications: 'No unread notifications.',

    farmerTitle: 'Farmer Produce & Harvest Lots',
    farmerSubtitle: 'Manage your aggregated harvest inventory, inspect verified institutional buyer offers, and track escrow-secured settlements with state APMC assurance.',
    fpoBadge: 'Govt. Certified Custody Hub • MSIS Nodal Aggregation',
    listNewHarvest: 'List New Harvest',
    lotFilters: 'Lot Filters',
    totalListedStock: 'Total Listed Stock',
    safeEscrowBalance: 'Safe Escrow Balance',
    pendingInquiries: 'Pending Inquiries',
    activeHarvestLots: 'Active Harvest Lots',
    activeInquiries: 'Active Inquiries',
    availableQty: 'AVAILABLE QTY',
    askingRate: 'ASKING RATE',
    moistureIndex: 'MOISTURE INDEX',
    apmcParity: 'APMC PARITY',
    printQrTag: 'Print QR Tag',
    viewOffers: 'View Offers',
    viewContract: 'View Contract',
    directBuyers: 'Direct Institutional Buyers',
    mspFloorTitle: 'Govt. MSP Floor Guarantee',
    mspFloorDesc: 'All harvest contracts initiated via AgroConnect include guaranteed MSP floor settlement backed by the Maharashtra State Agricultural Marketing Board (MSAMB).',
    incomingOffersTitle: 'Incoming Institutional Offers & Counter-Bids',
    noIncomingOffers: 'No active offers pending for this lot.',
    acceptOffer: 'Accept Offer & Create Contract',
    counterOfferBtn: 'Counter Offer',

    publishBatchTitle: 'List New Harvest Batch (Govt. Assay Certified)',
    commodityLabel: 'Commodity & Variety',
    harvestVolumeLabel: 'Harvest Volume (Metric Tonnes)',
    baseAskingRateLabel: 'Base Asking Rate (₹ / Quintal)',
    qualityGradeLabel: 'Quality Grade',
    moistureLabel: 'Moisture Percentage (%)',
    expectedDeliveryDaysLabel: 'Dispatch Lead Time (Days)',
    storageHubLabel: 'Custody Cold Storage / APMC Godown',
    publishLotBtn: 'Publish Harvest Lot',
    cancelBtn: 'Cancel',

    marketplaceTitle: 'Wholesale Produce Marketplace',
    marketplaceSubtitle: 'Connect directly with verified Maharashtra Farmer Producer Organizations (FPOs), review lab-tested batches, and place binding digital escrow offers.',
    activeLotsCount: 'Active Lots',
    dailyTrading: 'Daily Trading',
    filterCommodity: 'Commodity',
    filterGrade: 'Quality Grade',
    filterVolume: 'Minimum Volume',
    filterRegion: 'FPO Region',
    allCommodities: 'All Commodities',
    openOfferNegotiate: 'Open Offer & Negotiate',
    reviewBatchSpecs: 'Review Batch Specs',
    rfqConsoleTitle: 'Bilateral RFQ Negotiation Console',
    totalLotWeight: 'Total Lot Weight',
    lasalgaonAvg: 'APMC Prevailing Avg',
    dispatchReadiness: 'Dispatch Readiness',
    yourCounterBid: 'Your Counter Bid (₹ / qtl)',
    totalDealValue: 'Total Deal Value',
    escrowAdvanceReq: '50% Escrow Advance Required',
    submitCounterOffer: 'Submit Counter Offer',
    acceptTermsSign: 'Accept Terms & Sign',
    bidHistoryTitle: 'Negotiation Audit Trail & Bid History',
    backToMarketplace: 'Back to Marketplace',

    mandiIntelTitle: 'Mandi Price Intelligence',
    mandiIntelSubtitle: 'Real-time modal rates, arrival telemetry, and net realization across 585 APMC yards',
    avgFarmgatePremium: 'Avg Farmgate Premium',
    reportingMandis: 'Reporting Mandis',
    topGainerToday: "Today's Top Gainer",
    searchMandiPlaceholder: 'Search Mandi, District or Commodity...',
    marketTableMandi: 'MARKET (MANDI)',
    marketTableCrop: 'COMMODITY',
    marketTableModal: 'MODAL RATE',
    marketTableShift: '24H SHIFT',
    marketTableAction: 'ACTION',
    calcNetProfit: 'Calculate Net Profit',
    calcTitle: 'Net-in-Hand Transport Calculator',
    calcSubtitle: 'Calculate real take-home earnings deducting live freight, handling, and mandi cess',
    harvestQtyDispatch: 'HARVEST QUANTITY FOR DISPATCH',
    destApmc: 'DESTINATION APMC MARKET',
    netInHandTransfer: 'Net In-Hand Bank Transfer',
    lockRateBookTransport: 'Lock Rate & Book Transport',
    allCropsFilter: 'All Crops',

    escrowTitle: 'Smart Contracts & Escrow Milestone Payments',
    escrowSubtitle: 'Bi-party digital contracts with two-tier escrow protection: 50% advance locked pre-transit, 50% released upon APMC assay sign-off.',
    activeExecutedContracts: 'Active Executed Contracts',
    stepSigned: '1. Signed',
    stepAdvance: '2. Advance (50%)',
    stepInTransit: '3. In Transit',
    stepSettled: '4. Balance (50%)',
    stage1Advance: 'Stage 1 Advance (50%)',
    stage2Balance: 'Stage 2 Balance (50%)',
    eSignFarmer: 'E-Sign as Farmer (Aadhaar OTP)',
    eSignBuyer: 'E-Sign as Buyer (Digital Token)',
    lockAdvanceBtn: 'Lock Advance in Escrow (Buyer)',
    dispatchBtn: 'Dispatch Produce & Release Advance to Farmer',
    deliveredBtn: 'APMC Gate Arrival & Weighment Inspection',
    releaseFinalBtn: 'Release 100% Final Settlement (Buyer)',
    raiseDisputeBtn: 'Raise Dispute',

    disputeTitle: 'Grievance & 3-Tier Dispute Resolution',
    disputeSubtitle: 'Peer Negotiation → APMC Mandi Official Arbitration → State Marketing Board Appellate Panel.',
    fileGrievanceBtn: 'File Formal Grievance',
    activeGrievanceTickets: 'Active Grievance Tickets',
    tier1Peer: 'Tier 1: Peer',
    tier2Apmc: 'Tier 2: APMC',
    tier3State: 'Tier 3: State Panel',
    claimedDeduction: 'Claimed Deduction',
    agreedSettlement: 'Agreed Settlement',
    issueRulingBtn: 'Issue APMC Arbitrated Settlement',
    escalateToTier2Btn: 'Escalate to Tier 2 (APMC Secretary)',
    escalateToTier3Btn: 'Escalate to Tier 3 (MSAMB Appellate Panel)'
  },
  MR: {
    appTitle: 'ॲग्रो-कनेक्ट',
    hubSubtitle: 'महाराष्ट्र शासन कृषी-तंत्रज्ञान केंद्र (MSIS)',
    liveApmc: 'थेट बाजार समिती (APMC)',
    mspProtected: 'हमीभाव (MSP) आधार सक्रिय आणि सुरक्षित',
    mandiPricesTab: 'बाजार भाव',
    farmerProduceTab: 'शेतकरी शेतमाल',
    marketplaceTab: 'घाऊक बाजारपेठ',
    rfqTab: 'द्विपक्षीय वाटाघाटी',
    escrowContractsTab: 'एस्क्रो व करार',
    disputesTab: 'तक्रार निवारण',
    switchPersona: 'वापरकर्ता प्रोफाइल बदला:',
    notificationsTitle: 'थेट कृषी-सूचना व व्यवहार',
    noNotifications: 'नवीन सूचना नाहीत.',

    farmerTitle: 'शेतकरी शेतमाल व पीक लॉट्स',
    farmerSubtitle: 'तुमचा एकत्रित शेतमाल व्यवस्थापित करा, पडताळणी केलेल्या संस्थात्मक खरेदीदारांच्या मागण्या तपासा आणि शासकीय APMC हमीसह एस्क्रो व्यवहार सुरक्षित करा.',
    fpoBadge: 'शासकीय प्रमाणित केंद्र • MSIS शेतकरी उत्पादक संस्था',
    listNewHarvest: 'नवीन शेतमाल नोंदवा',
    lotFilters: 'फिल्टर्स',
    totalListedStock: 'एकूण नोंदवलेला साठा',
    safeEscrowBalance: 'सुरक्षित एस्क्रो शिल्लक',
    pendingInquiries: 'प्रलंबित मागण्या',
    activeHarvestLots: 'सक्रिय शेतमाल बॅचेस',
    activeInquiries: 'सक्रिय मागण्या',
    availableQty: 'उपलब्ध प्रमाण',
    askingRate: 'अपेक्षित दर',
    moistureIndex: 'आर्द्रता प्रमाण (Moisture)',
    apmcParity: 'APMC दर फरक',
    printQrTag: 'QR टॅग प्रिंट करा',
    viewOffers: 'मागण्या पहा',
    viewContract: 'करार पहा',
    directBuyers: 'थेट संस्थात्मक खरेदीदार',
    mspFloorTitle: 'शासकीय किमान हमीभाव (MSP) संरक्षण',
    mspFloorDesc: 'ॲग्रो-कनेक्टद्वारे होणाऱ्या सर्व करारांना महाराष्ट्र राज्य कृषी पणन मंडळ (MSAMB) द्वारे किमान हमीभावाचे पूर्ण संरक्षण मिळते.',
    incomingOffersTitle: 'संस्थात्मक खरेदीदारांकडून आलेल्या मागण्या व प्रति-दर',
    noIncomingOffers: 'या लॉटसाठी कोणतीही प्रलंबित मागणी नाही.',
    acceptOffer: 'मागणी स्वीकारा व करार तयार करा',
    counterOfferBtn: 'प्रति-दर पाठवा',

    publishBatchTitle: 'नवीन शेतमाल बॅच नोंदवा (शासकीय चाचणी प्रमाणित)',
    commodityLabel: 'शेतमाल व जात (Variety)',
    harvestVolumeLabel: 'एकूण प्रमाण (मेट्रिक टन)',
    baseAskingRateLabel: 'किमान अपेक्षित दर (रु./क्विंटल)',
    qualityGradeLabel: 'गुणवत्ता प्रत (Grade)',
    moistureLabel: 'आर्द्रता टक्केवारी (%)',
    expectedDeliveryDaysLabel: 'वाहतूक तयारी कालावधी (दिवस)',
    storageHubLabel: 'गोदाम / शीतगृह केंद्र',
    publishLotBtn: 'शेतमाल बाजारात सादर करा',
    cancelBtn: 'रद्द करा',

    marketplaceTitle: 'घाऊक शेतमाल बाजारपेठ',
    marketplaceSubtitle: 'महाराष्ट्रातील पडताळणी केलेल्या शेतकरी उत्पादक कंपन्यांशी (FPOs) थेट जोडा, लॅब-प्रमाणित बॅचेस तपासा आणि थेट एस्क्रो व्यवहार करा.',
    activeLotsCount: 'सक्रिय लॉट्स',
    dailyTrading: 'दैनिक व्यापार',
    filterCommodity: 'शेतमाल',
    filterGrade: 'गुणवत्ता प्रत',
    filterVolume: 'किमान प्रमाण',
    filterRegion: 'विभाग / जिल्हा',
    allCommodities: 'सर्व शेतमाल',
    openOfferNegotiate: 'मागणी नोंदवा व वाटाघाटी करा',
    reviewBatchSpecs: 'गुणवत्ता अहवाल पहा',
    rfqConsoleTitle: 'थेट द्विपक्षीय वाटाघाटी कक्ष (Bilateral RFQ)',
    totalLotWeight: 'एकूण वजन',
    lasalgaonAvg: 'बाजार समिती सरासरी दर',
    dispatchReadiness: 'वाहतूक सज्जता',
    yourCounterBid: 'तुमची प्रति-मागणी (रु./क्विंटल)',
    totalDealValue: 'एकूण व्यवहार मूल्य',
    escrowAdvanceReq: '५०% एस्क्रो आगाऊ रक्कम आवश्यक',
    submitCounterOffer: 'प्रति-मागणी (Counter-Offer) सादर करा',
    acceptTermsSign: 'अटी स्वीकारा व डिजिटल स्वाक्षरी करा',
    bidHistoryTitle: 'वाटाघाटी इतिहास व बोलींचा क्रम',
    backToMarketplace: 'मार्केटप्लेसवर परत जा',

    mandiIntelTitle: 'थेट कृषी उत्पन्न बाजार समिती भाव',
    mandiIntelSubtitle: 'महाराष्ट्रातील ५८५ बाजार समित्यांमधील दैनिक लिलाव दर, आवक आणि प्रत्यक्ष नफा',
    avgFarmgatePremium: 'शेतकरी सरासरी अतिरिक्त नफा',
    reportingMandis: 'सक्रिय बाजार समित्या',
    topGainerToday: 'आजचा सर्वाधिक तेजीतील शेतमाल',
    searchMandiPlaceholder: 'बाजार समिती, जिल्हा किंवा शेतमाल शोधा...',
    marketTableMandi: 'बाजार समिती (APMC)',
    marketTableCrop: 'शेतमाल',
    marketTableModal: 'सरासरी लिलाव दर',
    marketTableShift: '२४ तासांतील बदल',
    marketTableAction: 'कृती',
    calcNetProfit: 'प्रत्यक्ष नफा मोजा',
    calcTitle: 'प्रत्यक्ष नफा व वाहतूक खर्च गणक',
    calcSubtitle: 'लाईव्ह भाडे, हमाली आणि बाजार उपकर वजा जाता शेतकर्‍याच्या खात्यात जमा होणारी निव्वळ रक्कम मोजा',
    harvestQtyDispatch: 'वाहतुकीसाठी शेतमाल प्रमाण',
    destApmc: 'गंतव्य बाजार समिती (Destination Mandi)',
    netInHandTransfer: 'खात्यात जमा होणारी निव्वळ रक्कम (Net in Hand)',
    lockRateBookTransport: 'दर निश्चित करा व वाहन बुक करा',
    allCropsFilter: 'सर्व पिके',

    escrowTitle: 'स्मार्ट करार व टप्प्याटप्प्याने एस्क्रो वाटप',
    escrowSubtitle: 'दोन-स्तरीय एस्क्रो संरक्षण: वाहतुकीपूर्वी ५०% आगाऊ रक्कम जमा, तर बाजार समितीत गुणवत्ता तपासणीनंतर उर्वरित ५०% रक्कम थेट बँक खात्यात.',
    activeExecutedContracts: 'सक्रिय कायदेशीर करार',
    stepSigned: '१. स्वाक्षरी',
    stepAdvance: '२. आगाऊ (५०%)',
    stepInTransit: '३. वाहतुकीत',
    stepSettled: '४. अंतिम वाटप (५०%)',
    stage1Advance: 'टप्पा १: आगाऊ रक्कम (५०%)',
    stage2Balance: 'टप्पा २: उर्वरित रक्कम (५०%)',
    eSignFarmer: 'शेतकरी म्हणून स्वाक्षरी (आधार OTP)',
    eSignBuyer: 'खरेदीदार म्हणून स्वाक्षरी (डिजिटल टोकन)',
    lockAdvanceBtn: '५०% आगाऊ रक्कम एस्क्रोमध्ये जमा करा',
    dispatchBtn: 'माल रवाना करा व ५०% रक्कम शेतकऱ्याला द्या',
    deliveredBtn: 'APMC गेट आगमन व वजन तपासणी पूर्ण करा',
    releaseFinalBtn: '१००% अंतिम व्यवहार पूर्ण करा व रक्कम वितरित करा',
    raiseDisputeBtn: 'तक्रार दाखल करा',

    disputeTitle: '३-स्तरीय शासकीय तक्रार निवारण कक्ष',
    disputeSubtitle: 'थेट समेट (Peer) → बाजार समिती सचिव लवाद (Arbitration) → महाराष्ट्र राज्य कृषी पणन मंडळ अपील पॅनेल.',
    fileGrievanceBtn: 'औपचारिक तक्रार नोंदवा',
    activeGrievanceTickets: 'सक्रिय तक्रार अर्ज',
    tier1Peer: 'स्तर १: थेट समेट',
    tier2Apmc: 'स्तर २: बाजार समिती लवाद',
    tier3State: 'स्तर ३: राज्य पणन मंडळ',
    claimedDeduction: 'मागितलेली वजावट',
    agreedSettlement: 'अंतिम मंजूर तडजोड',
    issueRulingBtn: 'बाजार समिती लवाद निर्णय द्या',
    escalateToTier2Btn: 'स्तर २ (बाजार समिती सचिव) कडे वर्ग करा',
    escalateToTier3Btn: 'स्तर ३ (MSAMB राज्य पॅनेल) कडे वर्ग करा'
  }
};
