from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel

class CommodityTradePolicy(BaseModel):
    commodity: str
    import_basic_customs_duty_pct: float
    import_aidc_cess_pct: float
    total_effective_import_duty_pct: float
    export_duty_pct: float
    minimum_export_price_usd_tonne: Optional[float]
    buffer_stock_procurement_target_lmt: float  # Lakh Metric Tonnes (LMT)
    policy_status_tag: str  # 'PROTECTIONIST_HIGH_TARIFF', 'DUTY_FREE_IMPORT', 'EXPORT_RESTRICTED', 'OPEN_MARKET'
    price_impact_sentiment: str  # 'BULLISH_DOMESTIC_PRICES', 'BEARISH_IMPORT_PRESSURE', 'NEUTRAL'
    last_notification_ref: str
    effective_from: str

DGFT_POLICY_REGISTRY: Dict[str, Dict[str, Any]] = {
    "Soybean": {
        "commodity": "Soybean",
        "import_basic_customs_duty_pct": 20.0,
        "import_aidc_cess_pct": 7.5,
        "total_effective_import_duty_pct": 27.5,
        "export_duty_pct": 0.0,
        "minimum_export_price_usd_tonne": None,
        "buffer_stock_procurement_target_lmt": 15.0,
        "policy_status_tag": "PROTECTIONIST_HIGH_TARIFF",
        "price_impact_sentiment": "BULLISH_DOMESTIC_PRICES",
        "last_notification_ref": "DGFT-NOTIF-NO-48/2024-CUS",
        "effective_from": "2024-09-14"
    },
    "Onion": {
        "commodity": "Onion",
        "import_basic_customs_duty_pct": 0.0,
        "import_aidc_cess_pct": 0.0,
        "total_effective_import_duty_pct": 0.0,
        "export_duty_pct": 20.0,
        "minimum_export_price_usd_tonne": 550.0,
        "buffer_stock_procurement_target_lmt": 5.0,  # 5 LMT NAFED buffer
        "policy_status_tag": "EXPORT_RESTRICTED_MEP",
        "price_impact_sentiment": "MODERATE_PRICE_CAPPING",
        "last_notification_ref": "DGFT-NOTIF-NO-28/2024-EXPORT",
        "effective_from": "2024-05-04"
    },
    "Cotton": {
        "commodity": "Cotton",
        "import_basic_customs_duty_pct": 10.0,
        "import_aidc_cess_pct": 5.0,
        "total_effective_import_duty_pct": 11.0,
        "export_duty_pct": 0.0,
        "minimum_export_price_usd_tonne": None,
        "buffer_stock_procurement_target_lmt": 8.0,
        "policy_status_tag": "BALANCED_TARIFF",
        "price_impact_sentiment": "NEUTRAL",
        "last_notification_ref": "DGFT-NOTIF-NO-12/2024-TEX",
        "effective_from": "2024-03-31"
    },
    "Wheat": {
        "commodity": "Wheat",
        "import_basic_customs_duty_pct": 40.0,
        "import_aidc_cess_pct": 0.0,
        "total_effective_import_duty_pct": 40.0,
        "export_duty_pct": 0.0,
        "minimum_export_price_usd_tonne": None,
        "buffer_stock_procurement_target_lmt": 250.0,
        "policy_status_tag": "EXPORT_PROHIBITED",
        "price_impact_sentiment": "DOMESTIC_STABILIZED",
        "last_notification_ref": "DGFT-NOTIF-NO-06/2022-WHEAT",
        "effective_from": "2022-05-13"
    },
    "Gram": {
        "commodity": "Gram",
        "import_basic_customs_duty_pct": 0.0,
        "import_aidc_cess_pct": 0.0,
        "total_effective_import_duty_pct": 0.0,
        "export_duty_pct": 0.0,
        "minimum_export_price_usd_tonne": None,
        "buffer_stock_procurement_target_lmt": 12.0,
        "policy_status_tag": "DUTY_FREE_IMPORT",
        "price_impact_sentiment": "BEARISH_IMPORT_PRESSURE",
        "last_notification_ref": "DGFT-NOTIF-NO-09/2024-PULSES",
        "effective_from": "2024-05-03"
    },
    "Tur": {
        "commodity": "Tur",
        "import_basic_customs_duty_pct": 0.0,
        "import_aidc_cess_pct": 0.0,
        "total_effective_import_duty_pct": 0.0,
        "export_duty_pct": 0.0,
        "minimum_export_price_usd_tonne": None,
        "buffer_stock_procurement_target_lmt": 10.0,
        "policy_status_tag": "DUTY_FREE_IMPORT",
        "price_impact_sentiment": "BEARISH_IMPORT_PRESSURE",
        "last_notification_ref": "DGFT-NOTIF-NO-15/2024-PULSES",
        "effective_from": "2024-03-31"
    }
}

class DGFTPolicyService:
    @staticmethod
    def get_policy(commodity: str) -> CommodityTradePolicy:
        matched = None
        for k in DGFT_POLICY_REGISTRY.keys():
            if k.lower() in commodity.lower() or commodity.lower() in k.lower():
                matched = k
                break
        
        if matched and matched in DGFT_POLICY_REGISTRY:
            row = DGFT_POLICY_REGISTRY[matched]
            return CommodityTradePolicy(
                commodity=commodity.title(),
                import_basic_customs_duty_pct=row["import_basic_customs_duty_pct"],
                import_aidc_cess_pct=row["import_aidc_cess_pct"],
                total_effective_import_duty_pct=row["total_effective_import_duty_pct"],
                export_duty_pct=row["export_duty_pct"],
                minimum_export_price_usd_tonne=row["minimum_export_price_usd_tonne"],
                buffer_stock_procurement_target_lmt=row["buffer_stock_procurement_target_lmt"],
                policy_status_tag=row["policy_status_tag"],
                price_impact_sentiment=row["price_impact_sentiment"],
                last_notification_ref=row["last_notification_ref"],
                effective_from=row["effective_from"]
            )
        else:
            # Neutral open market agricultural policy baseline for unlisted commodities
            return CommodityTradePolicy(
                commodity=commodity.title(),
                import_basic_customs_duty_pct=0.0,
                import_aidc_cess_pct=0.0,
                total_effective_import_duty_pct=0.0,
                export_duty_pct=0.0,
                minimum_export_price_usd_tonne=None,
                buffer_stock_procurement_target_lmt=0.0,
                policy_status_tag="OPEN_MARKET_STANDARD",
                price_impact_sentiment="NEUTRAL",
                last_notification_ref="DGFT-STANDARD-OGL",
                effective_from="2024-01-01"
            )

    @staticmethod
    def get_all_policies() -> Dict[str, CommodityTradePolicy]:
        return {k: DGFTPolicyService.get_policy(k) for k in DGFT_POLICY_REGISTRY.keys()}
