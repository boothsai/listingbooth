/**
 * DDF_COMPLIANCE.md
 *
 * CREA DDF / VOW Compliance Requirements enforced in ListingBooth
 * ================================================================
 *
 * 1. BROKERAGE ATTRIBUTION (MANDATORY)
 *    - "Brokered by eXp Realty" must appear on every listing display
 *    - Third-party listings must show "Listing provided by [Listing Brokerage]"
 *
 * 2. TRADEMARKS (MANDATORY)
 *    - MLS® — registered trademark of CREA
 *    - REALTOR® — registered trademark of CREA
 *    - REALTORS® — registered trademark of CREA
 *    These symbols MUST be present wherever these words are used
 *
 * 3. DATA ATTRIBUTION (MANDATORY)
 *    - "Data supplied by CREA's Data Distribution Facility (DDF®)"
 *    - DDF® is also a registered trademark of CREA
 *
 * 4. VOW RULES (for Virtual Office Website compliance)
 *    - Only registered/authenticated users may access sold price data
 *    - Suppress private_remarks from public display
 *    - Display vow_allowed flag — if false, listing must not be shown
 *    - Automated valuation tools may only be shown to registered users
 *      (vow_automated_valuation field)
 *
 * 5. COPYRIGHT NOTICE (MANDATORY)
 *    - "© [Year] CREA. All rights reserved."
 *    - ListingBooth copyright
 *
 * 6. FRESHNESS (MANDATORY)
 *    - Listings must be refreshed within 24h of CREA DDF updates
 *    - Stale listings (is_active = false) must be clearly labelled
 *
 * 7. eXp REALTY BROKERAGE
 *    - "Brokered by eXp Realty" must appear prominently in the footer
 *      and on every individual listing display
 *    - eXp Realty is a registered REALTOR® brokerage
 */
