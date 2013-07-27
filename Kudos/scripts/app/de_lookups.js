(function (parent) {
    
    //#region Variables

    var lookups = parent.lookups = parent.lookups || {}, // DE.lookups
        dynamic = lookups.dynamic = lookups.dynamic || {}, // DE.lookups.dynamic
        formatted = lookups.formattedData = lookups.formattedData || {}, // DE.lookups.formattedData
        styleMap = lookups.styleMap = lookups.styleMap || {}; // DE.lookups.styleMap

    dynamic.funding_normal = {
        "Structure": {
            "FirstPayment": "-",
            "BankStatement": "-",
            "BuyDown": "-",
            "CashDown": "-",
            "DocumentFee": "-",
            "Expiration": "-",
            "HandlingFee": "-",
            "InsuranceDeductible": "-",
            "LicenseFee": "-",
            "LtvException": "-",
            "Misrouted": "-",
            "OtherFee": "-",
            "PaymentException": "-",
            "PayoffPriorDrive": "-",
            "PtiException": "-",
            "RedOrange": "-",
            "Resubmittal": "-",
            "SGuardGapDealerCommission": "-",
            "SGuardGapDealerCost": "-",
            "SGuardVSCDealerCost": "-",
            "SGuardVSCDealerCommission": "-",
            "Ssa": "-",
            "FrontendFee": "-",
            "Chapter13BKDismissalFundingFee": "-",
            "Esc": "-",
            "FixedIncomeCall": "-",
            "None": "-",
            "Other": "-",
            "PastDueBill": "-",
            "PayoffPriorDrive": "-",
            "CashdownFee": "-",
            "FloorPlanPayoff": "-",
            "TitleFee": "-",
            "FundingAdjustmentFee": {
                "BankStatement": "-",
                "Chapter13BKDismissalFundingFee": "-",
                "Esc": "-",
                "Expiration":"-",
                "FirstPayment": "-",
                "FixedIncomeCall": "-",
                "Gap": "-",
                "InsuranceDeductible": "-",
                "Misrouted": "-",
                "Misc": "-",
                "None": "-",
                "Other": "-",
                "PastDueBill": "-",
                "PayoffPriorDrive": "-",
                "Resubmittal": "-",                
                "Total": "-"
            }
        }
    };

    dynamic.funding_lease = {
        "Structure": {
            "Warranty": "-",
            "Gap": "-",
            "CreditHealthAndLife": "-",
            "Disability": "-",
            "Rebate": "-",
            "TradePayoff": "-",
            "TradeAllowance": "-",
            "NetEquity": "-",
            "Part": "-",
            "FloorPlanPayoff": "-"
        }
    };

    dynamic.lastApproval = {
        "FundingAdjustmentFee": {
            "BankStatement": "-",
            "Chapter13BKDismissalFundingFee": "-",
            "Esc": "-",
            "Expiration": "-",
            "FirstPayment": "-",
            "FixedIncomeCall": "-",
            "Gap": "-",
            "InsuranceDeductible": "-",
            "Misrouted": "-",
            "None": "-",
            "Other": "-",
            "PastDueBill": "-",
            "PayoffPriorDrive": "-",
            "Resubmittal": "-",
            "Total": "-",
            "LtvException": "-",
            "PtiException": "-",
            "PaymentException": "-",            
            "RedOrange": "-"
        },
        "Financing": {
            "Cashdown": "-",
            "Misc": "-",
            "MaxParticipation": "-",
            "Warranty": "-",
            "NetTradeIn": "-",
            "Participation": "-",
            "GapInsurance": "-",
            "CreditLife": "-",
            "Disability": "-",
            "Flat": "-",
            "MfrRebate": "-",
            "BuyDown": "-",
            "BuyDownPrice": "-",
            "SGuardGapDealerCommission": "-",
            "SGuardGapDealerCost": "-",
            "SGuardVSCDealerCommission": "-",
            "SGuardVSCContractCost": "-",
            "FloorPlanPayoff": "-"
        },
        "CoApplicant": {
            "FullName": "-",
            "StatedIncome": "-"
        }
    };

    dynamic.application = {
        "Summary": {
            "Decision": {
                "Financing": {
                    "CashDown": "-",
                    "Misc": "-",
                    "MaxParticipation": "-",
                    "Warranty": "-",
                    "NetTradeIn": "-",
                    "Participation": "-",
                    "GapInsurance": "-",
                    "CreditLife": "-",
                    "Disability": "-",
                    "Flat": "-",
                    "MfrRebate": "-",
                    "BuyDown": "-",
                    "FloorPlanPayoff": "-"
                },
                "CoApplicant": {
                    "FullName": "-",
                    "StatedIncome": "-"
                }
            }
        }
    };

    dynamic.fundingAdjustmentFee = {
        "BankStatement": "-",
        "Chapter13BKDismissalFundingFee": "-",
        "Esc": "-",
        "Expiration":"-",
        "FirstPayment": "-",
        "FixedIncomeCall": "-",
        "Gap": "-",
        "InsuranceDeductible": "-",
        "Misrouted": "-",
        "None": "-",
        "Other": "-",
        "PastDueBill": "-",
        "PayoffPriorDrive": "-",
        "Resubmittal": "-",
        "FloorPlanPayoff": "-",
        "Total": "-"
    }

    dynamic.leads = {
        "ApplicantInformation": {
            "LeadQualityIndicator": "-"
        }
    };

    formatted.funding = {
        "AmountFinanced": { "format": "price", "sign": "positive" },
        "BankStatement": { "format": "price", "sign": "positive" },
        "BaseDiscount": { "format": "price", "sign": "negative" },
        "BuyDown": { "format": "percent", "sign": "positive" },
        "CashDown": { "format": "price", "sign": "negative" },
        "CheckToDealer": { "format": "price", "sign": "positive" },
        "ContractFee": { "format": "price", "sign": "negative" },
        "DocumentFee": { "format": "price", "sign": "positive" },
        "Expiration": { "format": "price", "sign": "positive" },
        "Gap": { "format": "price", "sign": "positive" },
        "HandlingFee": { "format": "price", "sign": "positive" },
        "LicenseFee": { "format": "price", "sign": "positive" },
        "InsuranceDeductible": { "format": "price", "sign": "positive" },
        "LtvException": { "format": "price", "sign": "positive" },
        "PaymentException": { "format": "price", "sign": "positive" },
        "PayoffPriorDrive": { "format": "price", "sign": "positive" },
        "PtiException": { "format": "price", "sign": "positive" },
        "Rebate": { "format": "price", "sign": "negative" },
        "RedOrange": { "format": "price", "sign": "positive" },
        "Ssa": { "format": "price", "sign": "positive" },
        "FrontendFee": { "format": "price", "sign": "positive" },
        "Misrouted": { "format": "price", "sign": "positive" },
        "NetEquity": { "format": "price", "sign": "positive" },
        "OtherFee": { "format": "price", "sign": "positive" },
        "Participation": { "format": "price", "sign": "positive" },
        "PriceWithTax": { "format": "price", "sign": "positive" },
        "PriceWithoutTax": { "format": "price", "sign": "positive" },
        "Rebate": { "format": "price", "sign": "positive" },
        "Resubmittal": { "format": "price", "sign": "positive" },
        "SGuardGapDealerCommission": { "format": "price", "sign": "positive" },
        "SGuardGapDealerCost": { "format": "price", "sign": "negative" },
        "SGuardVSCDealerCommission": { "format": "price", "sign": "positive" },
        "SGuardVSCDealerCost": { "format": "price", "sign": "negative" },
        "SalesTax": { "format": "price", "sign": "positive" },
        "TitleFee": { "format": "price", "sign": "positive" },
        "TotalBackEnd": { "format": "price", "sign": "positive" },
        "TotalDown": { "format": "price", "sign": "negative" },
        "TotalFundingAdjustments": { "format": "price", "sign": "negative" },
        "TradeAllowance": { "format": "price", "sign": "negative" },
        "TradePayoff": { "format": "price", "sign": "positive" },
        "Warranty": { "format": "price", "sign": "positive" },
        "Advance": { "format": "percent", "sign": "positive" },
        "ApprovalExpiration": { "format": "dateTime", "sign": "positive" },
        "BookValue": { "format": "price", "sign": "positive" },
        "ContractDate": { "format": "dateTime", "sign": "positive" },
        "DebtToIncome": { "format": "percent", "sign": "positive" },
        "FirstPayment": { "format": "dateTime", "sign": "positive" },
        "FundedDate": { "format": "dateTime", "sign": "positive" },
        "LastFaxReceived": { "format": "dateTime", "sign": "positive" },
        "LoanToValue": { "format": "percent", "sign": "positive" },
        "PaymentToIncome": { "format": "percent", "sign": "positive" },
        "VerifiedIncome": { "format": "price", "sign": "positive" },
        "Chapter13BKDismissalFundingFee": { "format": "price", "sign": "positive" },
        "CashdownFee": { "format": "price", "sign": "positive" },
        "Esc": { "format": "price", "sign": "positive" },
        "FixedIncomeCall": { "format": "price", "sign": "positive" },
        "None": { "format": "price", "sign": "positive" },
        "Other": { "format": "price", "sign": "positive" },
        "PastDueBill": { "format": "price", "sign": "positive" },
        "FloorPlanPayoff": { "format": "price", "sign": "positive" },
        "CustomerAcqFee": { "format": "price", "sign": "positive" },
        "CapCostReduction": { "format": "price", "sign": "positive" },
        "CapCost": { "format": "price", "sign": "positive" },
        "BaseMoneyFactor": { "format": "number", "sign": "positive", "digits": "5" },
        "Part": { "format": "percent", "sign": "positive" },
        "FinalMoneyFactor": { "format": "number", "sign": "positive", "digits": "5" },
        "ResidualPercent": { "format": "percent", "sign": "positive" },
        "ResidualAmount": { "format": "price", "sign": "positive" },
        "MilesPerYear": { "format": "other", "sign": "positive" },
        "LoanTerm": { "format": "other", "sign": "positive" },
        "Payment": { "format": "price", "sign": "positive" },
        "MSRP": { "format": "price", "sign": "positive" },
        "Invoice": { "format": "price", "sign": "positive" },
        "Disability": { "format": "price", "sign": "positive" },
        "CreditHealthAndLife": { "format": "price", "sign": "positive" },
        "PartAmount": { "format": "price", "sign": "positive" },
        "GrossCapCost": { "format": "price", "sign": "positive" },
        "NetCapCost": { "format": "price", "sign": "positive" },
        "CapCostReductionTax": { "format": "price", "sign": "positive" },
        "AdjustedResidualAmount": { "format": "price", "sign": "positive" },
        "TotalFirstPayment": { "format": "price", "sign": "positive" },
        "LeaseCheckToDealer": { "format": "price", "sign": "positive" }
    };

    formatted.lastApproval = {
        "StatedIncome": { "format": "price", "sign": "positive" },
        "AcquisitionFee": { "format": "percent", "sign": "positive" },
        "AcquisitionFeeAmount": { "format": "price", "sign": "positive" },
        "AmountFinanceCredit": { "format": "price", "sign": "positive" },
        "AmountFinanceCars": { "format": "price", "sign": "positive" },
        "AssignmentFee": { "format": "price", "sign": "positive" },
        "Book": { "format": "price", "sign": "positive" },
        "SubmittedBook": { "format": "price", "sign": "positive" },
        "SalesPrice": { "format": "price", "sign": "positive" },
        "Ttl": { "format": "price", "sign": "positive" },
        "Misc": { "format": "price", "sign": "positive" },
        "SalesTtlMisc": { "format": "price", "sign": "positive" },
        "CashDown": { "format": "price", "sign": "positive" },
        "TotalDownPayment": { "format": "price", "sign": "positive" },
        "BackEndFinancing": { "format": "price", "sign": "positive" },
        "BuyRate": { "format": "percent", "sign": "positive" },
        "ContractRate": { "format": "percent", "sign": "positive" },
        "Payment": { "format": "price", "sign": "positive" },
        "TotalFee": { "format": "price", "sign": "positive" },
        "AnalystFax": { "format": "phone" },
        "FundingPhone": { "format": "phone" },
        "AnalystDirectPhone": { "format": "phone" },
        "CreditGeneralPhone": { "format": "phone" },
        "PayoffPhone": { "format": "phone" },
        //"MaxPti": { "format": "percent", "sign": "positive" },
        //"MaxDti": { "format": "percent", "sign": "positive" },
        "MaxTotalBackend": { "format": "price", "sign": "positive" },
        "MaxTotalBackendPer": { "format": "percent", "sign": "positive" },
        "MaxTotalDown": { "format": "price", "sign": "positive" },
        "MinCashDown": { "format": "price", "sign": "positive" },
        "MinCashDownEquity": { "format": "price", "sign": "positive" },
        "MaxLoanFinal": { "format": "price", "sign": "positive" },
        "MaxParticipation": { "format": "percent", "sign": "positive" },
        "MaxPayment": { "format": "price", "sign": "positive" },
        "MaxAmountFinanced": { "format": "price", "sign": "positive" },
        "MfrRebate": { "format": "price", "sign": "positive" },
        "Warranty": { "format": "price", "sign": "positive" },
        "NetTradeIn": { "format": "price", "sign": "positive" },
        "GapInsurance": { "format": "price", "sign": "positive" },
        "CreditLife": { "format": "price", "sign": "positive" },
        "Disability": { "format": "price", "sign": "positive" },
        "BuyDown": { "format": "percent", "sign": "positive" },
        "BuyDownPrice": { "format": "price", "sign": "positive" },
        "ContractFee": { "format": "price", "sign": "negative" },
        "CheckToDealer": { "format": "price", "sign": "positive" },
        "BaseDiscount": { "format": "price", "sign": "negative" },
        // Funding Adjustment Fees - For Purchase Letter
        "BankStatement": { "format": "price", "sign": "positive" },
        "Chapter13BKDismissalFundingFee": { "format": "price", "sign": "positive" },
        "Esc": { "format": "price", "sign": "positive" },
        "Expiration": { "format": "price", "sign": "positive" },
        "FirstPayment": { "format": "dateTime", "sign": "positive" },
        "FixedIncomeCall": { "format": "price", "sign": "positive" },
        "Gap": { "format": "price", "sign": "positive" },
        "InsuranceDeductible": { "format": "price", "sign": "positive" },
        "Misrouted": { "format": "price", "sign": "positive" },
        "Misc": { "format": "price", "sign": "positive" },
        "None": { "format": "price", "sign": "positive" },
        "Other": { "format": "price", "sign": "positive" },
        "PastDueBill": { "format": "price", "sign": "positive" },
        "PayoffPriorDrive": { "format": "price", "sign": "positive" },
        "Resubmittal": { "format": "price", "sign": "positive" },
        "Total": { "format": "price", "sign": "positive" },
        "SGuardGapDealerCommission": { "format": "price", "sign": "positive" },
        "SGuardGapDealerCost": { "format": "price", "sign": "negative" },
        "SGuardVSCDealerCommission": { "format": "price", "sign": "positive" },
        "SGuardVSCContractCost": { "format": "price", "sign": "negative" },
        "Adjustment": { "format": "price", "sign": "negative" },
        "NetCapCost": { "format": "price", "sign": "positive" },
        "NetCustomerAcqFee": { "format": "price", "sign": "negative" },
        "LeaseFirstPayment": { "format": "price", "sign": "negative" },
        "SecurityDeposit": { "format": "price", "sign": "negative" },
        "Participation": { "format": "price", "sign": "positive" },
        // Additional Fields
        "LtvException": { "format": "price", "sign": "positive" },
        "PtiException": { "format": "price", "sign": "positive" },
        "PaymentException": { "format": "price", "sign": "positive" },
        "FloorPlanPayoff": { "format": "price", "sign": "positive" },
        "RedOrange": { "format": "price", "sign": "positive" }
    };

    formatted.fundingAdjusmentFee = {
        "BankStatement": { "format": "price", "sign": "positive" },
        "Chapter13BKDismissalFundingFee": { "format": "price", "sign": "positive" },
        "Esc": { "format": "price", "sign": "positive" },
        "Expiration": { "format": "price", "sign": "positive" },
        "FirstPayment": { "format": "dateTime", "sign": "positive" },
        "FixedIncomeCall": { "format": "price", "sign": "positive" },
        "Gap": { "format": "price", "sign": "positive" },
        "InsuranceDeductible": { "format": "price", "sign": "positive" },
        "Misrouted": { "format": "price", "sign": "positive" },
        "Misc": { "format": "price", "sign": "positive" },
        "None": { "format": "price", "sign": "positive" },
        "Other": { "format": "price", "sign": "positive" },
        "PastDueBill": { "format": "price", "sign": "positive" },
        "PayoffPriorDrive": { "format": "price", "sign": "positive" },
        "Resubmittal": { "format": "price", "sign": "positive" },
        "Total": { "format": "price", "sign": "positive" }
    };

    formatted.application = {
        "StatedIncome": { "format": "price", "sign": "positive" },
        "AmountFinanced": { "format": "price", "sign": "positive" },
        "Book": { "format": "price", "sign": "positive" },
        "SubmittedBook": { "format": "price", "sign": "positive" },
        "SalesPrice": { "format": "price", "sign": "positive" },
        "Ttl": { "format": "price", "sign": "positive" },
        "SalesTtlMisc": { "format": "price", "sign": "positive" },
        "CashDown": { "format": "price", "sign": "positive" },
        "TotalDownPayment": { "format": "price", "sign": "positive" },
        "BackEndFinancing": { "format": "price", "sign": "positive" },
        "AmountFinanceCredit": { "format": "price", "sign": "positive" },
        "AmountFinanceCars": { "format": "price", "sign": "positive" },
        "BuyRate": { "format": "percent", "sign": "positive" },
        "BuyDown": { "format": "percent", "sign": "positive" },
        "ContractRate": { "format": "percent", "sign": "positive" },
        "Payment": { "format": "price", "sign": "positive" },
        "AcquisitionFee": { "format": "percent", "sign": "positive" },
        "AssignmentFee": { "format": "price", "sign": "positive" },
        "AcquisitionFeeAmount": { "format": "price", "sign": "positive" },
        "Flat": { "format": "price", "sign": "positive" },
        "TotalFee": { "format": "price", "sign": "positive" },
        "AnalystFax": { "format": "phone" },
        "FundingPhone": { "format": "phone" },
        "AnalystDirectPhone": { "format": "phone" },
        "CreditGeneralPhone": { "format": "phone" },
        "Phone": { "format": "phone" },
        "PayoffPhone": { "format": "phone" },
        "Phone": { "format": "phone" },
        //"MaxPti": { "format": "percent", "sign": "positive" },
        //"MaxDti": { "format": "percent", "sign": "positive" },
        "MaxTotalBackend": { "format": "price", "sign": "positive" },
        "MaxTotalBackendPer": { "format": "percent", "sign": "positive" },
        "MaxTotalDown": { "format": "price", "sign": "positive" },
        "MinCashDown": { "format": "price", "sign": "positive" },
        "MinCashDownEquity": { "format": "price", "sign": "positive" },
        "AmountFinance": { "format": "price", "sign": "positive" },
        "MaxLoanFinal": { "format": "price", "sign": "positive" },
        "MaxParticipation": { "format": "percent", "sign": "positive" },
        "MaxPayment": { "format": "price", "sign": "positive" },
        "MaxAmountFinanced": { "format": "price", "sign": "positive" },
        "MfrRebate": { "format": "price", "sign": "positive" },
        "Misc": { "format": "price", "sign": "positive" },
        "Warranty": { "format": "price", "sign": "positive" },
        "NetTradeIn": { "format": "price", "sign": "positive" },
        "Participation": { "format": "percent", "sign": "positive" },
        "GapInsurance": { "format": "price", "sign": "positive" },
        "CreditLife": { "format": "price", "sign": "positive" },
        "Disability": { "format": "price", "sign": "positive" },
        "BalloonFactor": { "format": "percent", "sign": "positive" },
        "BalloonPayment": { "format": "price", "sign": "positive" },
        "MSRP": { "format": "price", "sign": "positive" },
        "ResidualValue": { "format": "price", "sign": "positive" },
        "ResidualPercent": { "format": "percent", "sign": "positive" },
        "CapCost": { "format": "price", "sign": "positive" },
        "CapCostReduction": { "format": "price", "sign": "positive" },
        "NetCapCost": { "format": "price", "sign": "positive" },
        "BaseMoneyFactor": { "format": "number", "sign": "positive", "digits": "5" },
        "FinalMoneyFactor": { "format": "number", "sign": "positive", "digits": "5" },
        "SecurityDeposit": { "format": "price", "sign": "positive" }
    };

    formatted.leads = {
        "StatedMonthlyIncome": { "format": "price", "sign": "positive" },
        "HomePhone": { "format": "phone" },
        "WorkPhone": { "format": "phone" },
        "MobilePhone": { "format": "phone" },
        "ApprovalExpirationDate": { "format": "dateTime" },
        "MaximumApprovedAmount": { "format": "price", "sign": "positive" },
        "AnnualPercentageRate": { "format": "percent", "sign": "positive" },
        "MaximumLoanToValue": { "format": "percent", "sign": "positive" },
        "RequiredDownPayment": { "format": "price", "sign": "positive" },
        "MinimumLoanAmount": { "format": "price", "sign": "positive" }
    };

    formatted.updateOffer = {
        "ApprovedLoanAmount": { "format": "price", "sign": "positive" },
        "MonthlyPayment": { "format": "price", "sign": "positive" },
        "APR": { "format": "percent", "sign": "positive" },
        "DownPayment": { "format": "price", "sign": "positive" }
    };

    styleMap.slideDeck = {
        "Pending": { "iconStyle": "glyphicons pending", "style": "status-pending" },
        "Discrepancy": { "iconStyle": "glyphicons discrepancy", "style": "status-discrepancy" },
        "Funded": { "iconStyle": "glyphicons funded", "style": "status-funded" },
        "Returned": { "iconStyle": "glyphicons returned", "style": "status-returned" },
        "Approved": { "iconStyle": "glyphicons approved", "style": "status-approved" },
        "Declined": { "iconStyle": "glyphicons declined", "style": "status-declined" },
        "Conditioned": { "iconStyle": "glyphicons conditioned", "style": "status-conditioned" },
        "Duplicate": { "iconStyle": "glyphicons duplicate", "style": "status-duplicate" },
        "Waived": { "iconStyle": "glyphicons waived", "style": "status-waived" },
        "Review": { "iconStyle": "glyphicons review", "style": "status-review" },
        "Approved Expired": { "iconStyle": "glyphicons approved-expired", "style": "status-approved-expired" },
        "Contract Verification": { "iconStyle": "glyphicons approved", "style": "status-approved" },
        "Data Entry": { "iconStyle": "glyphicons approved-expired", "style": "status-approved-expired" },
        "Entry Complete": { "iconStyle": "glyphicons review", "style": "status-review" },
        "Missing Information": { "iconStyle": "glyphicons review", "style": "status-review" },
        "Contract Received": { "iconStyle": "glyphicons approved", "style": "status-approved" },
        "ContractReceived": { "iconStyle": "glyphicons approved", "style": "status-approved" },
        "Rejected by Customer": { "iconStyle": "glyphicons approved-expired", "style": "status-approved-expired" },
        "In Review": { "iconStyle": "glyphicons review", "style": "status-review" },
        "Expired": { "iconStyle": "glyphicons approved-expired", "style": "status-approved-expired" },
        "Compliance Review": { "iconStyle": "glyphicons review", "style": "status-review" },
        "Purchased": { "iconStyle": "glyphicons funded", "style": "status-funded" },
        "Contract Returned": { "iconStyle": "glyphicons approved", "style": "status-approved" },
        "Dealer Hold": { "iconStyle": "glyphicons review", "style": "status-review" },
        "Verification Hold": { "iconStyle": "glyphicons review", "style": "status-review" },
        "Audit Review": { "iconStyle": "glyphicons review", "style": "status-review" },
        "Rejected": { "iconStyle": "glyphicons declined", "style": "status-declined" },
        "Webleads": { "iconStyle": "glyphicons webleads", "style": "status-webleads" },
    };

    styleMap.fundingApplicationVerification = {
        "Discrepancy": { "style": "glyphicons discrepancy" },
        "Waived": { "style": "glyphicons waived" }
    };

    lookups.errorMessage = {
        401: {
            "errorText": "You are not logged in as your login credentials could not be verified. Please try to log in again.",
            "errorButtonText": "Try Again",
            "redirectToHome": true
        },
        0: {
            "errorText": "A server request timeout happened due to some error. Please try again after sometime.",
            "errorButtonText": "Continue",
            "redirectToHome": false
        },
        500: {
            "errorText": "There was an error in processing your request. Please try again after sometime.",
            "errorButtonText": "Continue",
            "redirectToHome": false
        },
        400: {
            "errorText": "Your request contains some invalid data. Please ensure that provided inputs are correct and try again.",
            "errorButtonText": "Continue",
            "redirectToHome": false
        },
        410: {
            "errorText": "Your account is locked. Please contact your administrator for more help."
        }
    };

    lookups.stateAgeConfig = {
        "MS": 18,
        "AL": 18,
        "NE": 18
    }

    lookups.siteSettingsParams = {
        siteCompanyMapping: {
            "8" : "chrysler"
        },
        Invisible: {
            "chrysler": {
                "Global": ["#userManagementBtn", "#mySettingsBtn", "#changePassword", "#sGuardLinks", "#videos-social", "#leadsText"],
                "Funding": [""],
                "Applications": ["#sGuardLink", "#sGuardLinkRehash"],
                "Leads": ["#updateOfferBtn", "#pdfPacketBtn", "#sGuardLinkRehash"],
                "SubmitApp": [""],
                "UserManagement": [""]
            }
        },
        Content: {
            selector: {
                "default": ".default",
                "chrysler": ".chrysler"
            }
        },
        Links: {
            "Documents": {
                selector: ".dealerDocs",
                href: {
                    "default": "https://www.santanderconsumerusa.com/dealers/dealer-resources",
					"chrysler": "https://dealers.chryslercapital.com/training/"
                }
            },
            "Privacy": {
                selector: "#privacy",
                href: {
                    "default": "https://www.santanderconsumerusa.com/About/Privacy",
                    "chrysler": "http://www.chryslercapital.com/privacy"
                }
            },
            "ContactUs": {
                selector: ".contactUs",
                href: {
                    "default": "https://www.santanderconsumerusa.com/dealers/dealer-contact-information",
                    "chrysler": "http://www.chryslercapital.com/dealers/contact-info"
                }
            },
            "CopyRight": {
                selector: "#copyright",
                href: {
                    "default": "http://www.santanderconsumerusa.com",
                    "chrysler": "http://www.chryslercapital.com"
                },
                text: {
                    "default": "Santander Consumer USA",
                    "chrysler": "Chrysler Capital"
                }
            },
            "FundingChecklist": {
                selector: "#fundingChecklist",
                href: {
                    "default": "https://scusa-docs.s3.amazonaws.com/SCUSA_Funding_Checklist_v9.9.4_fnl.pdf",
                    "chrysler": "http://docs.chryslercapital.com/documents/?source=dealerconnect"
                }
            }
        },
        Images: {
            "FullLogo": {
                selector: "#fullLogo",
                src: {
                    "default": "images/logo.png?w=160&amp;h=47&amp;as=1"
                }
            }
        }
    };

    //#region Private methods

    //#region Constructors

    //#region Public methods

} (DE));