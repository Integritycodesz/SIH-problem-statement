import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Set background color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
    """Set cell padding in dxa (1 pt = 20 dxa; 60 dxa = 3 pt)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}>'
                      f'<w:top w:w="{top}" w:type="dxa"/>'
                      f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
                      f'<w:left w:w="{left}" w:type="dxa"/>'
                      f'<w:right w:w="{right}" w:type="dxa"/>'
                      f'</w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    """Set clean subtle horizontal borders for tables."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'<w:tblBorders {nsdecls("w")}>'
                        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:left w:val="none"/>'
                        f'<w:right w:val="none"/>'
                        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
                        f'<w:insideV w:val="none"/>'
                        f'</w:tblBorders>')
    tblPr.append(borders)

def set_card_borders(table, border_color="CBD5E1", sz="4"):
    """Full box border for cards."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'<w:tblBorders {nsdecls("w")}>'
                        f'<w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{border_color}"/>'
                        f'<w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{border_color}"/>'
                        f'<w:left w:val="single" w:sz="16" w:space="0" w:color="1B365D"/>'
                        f'<w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{border_color}"/>'
                        f'<w:insideH w:val="none"/>'
                        f'<w:insideV w:val="none"/>'
                        f'</w:tblBorders>')
    tblPr.append(borders)

def make_row_cant_split(row):
    """Prevent table row from splitting across pages."""
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

def add_header_footer(doc):
    """Configure running header and page numbering footer."""
    for s in doc.sections:
        # Running Header
        header = s.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.paragraph_format.space_after = Pt(2)
        hrun = hp.add_run("Smart India Hackathon 2026  |  Team Integrity  |  PS ID: SIH26132")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8)
        hrun.font.color.rgb = RGBColor(100, 116, 139)

        # Running Footer
        footer = s.footer
        fp = footer.paragraphs[0]
        fp.paragraph_format.space_before = Pt(2)
        frun1 = fp.add_run("AgroConnect — Detailed Project Report  |  Theme: Agriculture, FoodTech")
        frun1.font.name = "Arial"
        frun1.font.size = Pt(8)
        frun1.font.color.rgb = RGBColor(100, 116, 139)

        frun2 = fp.add_run("\tPage ")
        frun2.font.name = "Arial"
        frun2.font.size = Pt(8)
        frun2.font.color.rgb = RGBColor(100, 116, 139)

        # Dynamic Page Field
        fld1 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
        instr1 = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> PAGE </w:instrText>')
        fld2 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
        fld3 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
        frun2._r.append(fld1)
        frun2._r.append(instr1)
        frun2._r.append(fld2)
        frun2._r.append(fld3)

        frun3 = fp.add_run(" of ")
        frun3.font.name = "Arial"
        frun3.font.size = Pt(8)
        frun3.font.color.rgb = RGBColor(100, 116, 139)

        # Dynamic Total Pages Field
        fld4 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
        instr2 = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> NUMPAGES </w:instrText>')
        fld5 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
        fld6 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')
        frun3._r.append(fld4)
        frun3._r.append(instr2)
        frun3._r.append(fld5)
        frun3._r.append(fld6)

def format_h1(p, text):
    """Section Heading (H1)."""
    p.paragraph_format.space_before = Pt(7)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(27, 54, 93) # Navy (#1B365D)
    return run

def format_h2(p, text):
    """Sub-point Heading (H2)."""
    p.paragraph_format.space_before = Pt(4.5)
    p.paragraph_format.space_after = Pt(1.5)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(9.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(43, 108, 176) # Slate Blue (#2B6CB0)
    return run

def format_body(p, text="", bold_prefix=""):
    """Body paragraph with optional bold lead-in."""
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.10
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(8.6)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(30, 41, 59)
    if text:
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(8.6)
        run.font.color.rgb = RGBColor(51, 65, 85)
        return run

def format_bullet(p, text="", bold_prefix=""):
    """Compact bullet item."""
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(1.5)
    p.paragraph_format.line_spacing = 1.08
    p.paragraph_format.left_indent = Inches(0.16)
    r_bullet = p.add_run("•  ")
    r_bullet.font.name = "Arial"
    r_bullet.font.size = Pt(8.6)
    r_bullet.font.bold = True
    r_bullet.font.color.rgb = RGBColor(43, 108, 176)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(8.6)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(30, 41, 59)
    if text:
        run = p.add_run(text)
        run.font.name = "Arial"
        run.font.size = Pt(8.6)
        run.font.color.rgb = RGBColor(51, 65, 85)
        return run

def add_callout(doc, title, text, bg_hex="F0F7FF", border_hex="1B365D"):
    """Highlight card with left accent bar."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(7.1)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
    
    # Left accent border only
    tblPr = tbl._tbl.tblPr
    borders = parse_xml(f'<w:tblBorders {nsdecls("w")}>'
                        f'<w:top w:val="none"/>'
                        f'<w:bottom w:val="none"/>'
                        f'<w:left w:val="single" w:sz="18" w:space="0" w:color="{border_hex}"/>'
                        f'<w:right w:val="none"/>'
                        f'<w:insideH w:val="none"/>'
                        f'<w:insideV w:val="none"/>'
                        f'</w:tblBorders>')
    tblPr.append(borders)
    make_row_cant_split(tbl.rows[0])
    
    cp = cell.paragraphs[0]
    cp.paragraph_format.space_before = Pt(0)
    cp.paragraph_format.space_after = Pt(1)
    r_title = cp.add_run(title)
    r_title.font.name = "Arial"
    r_title.font.size = Pt(8.6)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(27, 54, 93)
    
    cp2 = cell.add_paragraph()
    cp2.paragraph_format.space_before = Pt(0)
    cp2.paragraph_format.space_after = Pt(0)
    cp2.paragraph_format.line_spacing = 1.08
    r_txt = cp2.add_run(text)
    r_txt.font.name = "Arial"
    r_txt.font.size = Pt(8.3)
    r_txt.font.italic = True
    r_txt.font.color.rgb = RGBColor(30, 41, 59)

def format_table_header(row, col_widths, titles):
    make_row_cant_split(row)
    for i, title in enumerate(titles):
        cell = row.cells[i]
        cell.width = col_widths[i]
        set_cell_background(cell, "1B365D")
        set_cell_margins(cell, top=50, bottom=50, left=90, right=90)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(title)
        run.font.name = "Arial"
        run.font.size = Pt(8.2)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

def style_data_row(row, col_widths, values, is_even=False):
    make_row_cant_split(row)
    bg_color = "F8FAFC" if is_even else "FFFFFF"
    for i, val in enumerate(values):
        cell = row.cells[i]
        cell.width = col_widths[i]
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=45, bottom=45, left=90, right=90)
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.08
        if isinstance(val, tuple):
            r1 = p.add_run(val[0])
            r1.font.name = "Arial"
            r1.font.size = Pt(8.0)
            r1.font.bold = True
            r1.font.color.rgb = RGBColor(30, 41, 59)
            r2 = p.add_run(val[1])
            r2.font.name = "Arial"
            r2.font.size = Pt(8.0)
            r2.font.color.rgb = RGBColor(51, 65, 85)
        else:
            run = p.add_run(str(val))
            run.font.name = "Arial"
            run.font.size = Pt(8.0)
            run.font.color.rgb = RGBColor(51, 65, 85)

def build_sih_dpr(output_path):
    doc = docx.Document()
    
    # A4 Page Setup (0.58 in margins)
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.58)
    section.bottom_margin = Inches(0.58)
    section.left_margin = Inches(0.58)
    section.right_margin = Inches(0.58)

    add_header_footer(doc)

    # =========================================================================
    # PAGE 1: COVER SECTION & IDEA / PROPOSED SOLUTION
    # =========================================================================
    p_main = doc.add_paragraph()
    p_main.paragraph_format.space_before = Pt(0)
    p_main.paragraph_format.space_after = Pt(1)
    p_main.paragraph_format.keep_with_next = True
    r_top = p_main.add_run("SMART INDIA HACKATHON 2026 — DETAILED PROJECT REPORT")
    r_top.font.name = "Arial"
    r_top.font.size = Pt(8.5)
    r_top.font.bold = True
    r_top.font.color.rgb = RGBColor(100, 116, 139)

    p_sol = doc.add_paragraph()
    p_sol.paragraph_format.space_before = Pt(0)
    p_sol.paragraph_format.space_after = Pt(3)
    p_sol.paragraph_format.keep_with_next = True
    r_sol = p_sol.add_run("AgroConnect: Cloud-Native Agricultural Market Linkage & Price Discovery Exchange")
    r_sol.font.name = "Arial"
    r_sol.font.size = Pt(13)
    r_sol.font.bold = True
    r_sol.font.color.rgb = RGBColor(27, 54, 93)

    format_h1(doc.add_paragraph(), "1. Cover Section")
    
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_w = [Inches(2.1), Inches(5.0)]
    set_table_borders(meta_table, color="CBD5E1", sz="4")

    meta_data = [
        (("Team Name", ""), ("Integrity", "")),
        (("Problem Statement ID", ""), ("SIH26132", "")),
        (("Problem Statement Title", ""), ("Strengthening Market Linkages and Price Discovery for Farmers", "")),
        (("Theme & Category", ""), ("Agriculture, FoodTech  |  Category: Software", "")),
        (("Idea / Solution Title", ""), ("AgroConnect (Integrated Bilingual Agritech Procurement & Dispute Redressal Portal)", "")),
    ]

    for idx, (label, val) in enumerate(meta_data):
        row = meta_table.rows[idx]
        make_row_cant_split(row)
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for c_idx, cell in enumerate(row.cells):
            cell.width = col_w[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=40, bottom=40, left=90, right=90)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            if c_idx == 0:
                r = p.add_run(label[0])
                r.font.name = "Arial"
                r.font.size = Pt(8.3)
                r.font.bold = True
                r.font.color.rgb = RGBColor(30, 41, 59)
            else:
                r = p.add_run(val[0])
                r.font.name = "Arial"
                r.font.size = Pt(8.3)
                r.font.color.rgb = RGBColor(51, 65, 85)

    p_nodal = doc.add_paragraph()
    p_nodal.paragraph_format.space_before = Pt(2)
    p_nodal.paragraph_format.space_after = Pt(5)
    r_nodal = p_nodal.add_run("Nodal Agency: ")
    r_nodal.font.name = "Arial"
    r_nodal.font.size = Pt(8.0)
    r_nodal.font.bold = True
    r_nodal.font.color.rgb = RGBColor(71, 85, 105)
    r_nodal_txt = p_nodal.add_run("Government of Maharashtra & Maharashtra State Innovation Society (MSIS)  |  Target Scope: 585+ Regulated APMCs")
    r_nodal_txt.font.name = "Arial"
    r_nodal_txt.font.size = Pt(8.0)
    r_nodal_txt.font.color.rgb = RGBColor(71, 85, 105)

    format_h1(doc.add_paragraph(), "2. Idea / Proposed Solution")
    
    format_body(doc.add_paragraph(), 
        "AgroConnect is a unified, cloud-native agritech exchange engineered to eliminate severe information asymmetry and settlement vulnerability across Maharashtra's agricultural supply chain. Built for smallholder farmers, Farmer Producer Organizations (FPOs), institutional corporate buyers (food processors, bulk retailers, exporters), APMC mandi officials, and the Maharashtra State Agricultural Marketing Board (MSAMB), the platform replaces fragmented middlemen networks with direct procurement channels. AgroConnect integrates real-time price telemetry across 585+ APMCs, automated GIS freight calculation, legally enforceable e-contracts, milestone-based smart escrow, and a 3-tier statutory dispute resolution tribunal into an accessible bilingual interface (Marathi and English).")

    format_h2(doc.add_paragraph(), "Key Differentiators vs. Existing Solutions")

    format_bullet(doc.add_paragraph(), 
        "Traditional portals rely on open credit cycles leading to 15–45 day payment delays and arbitrary post-arrival deductions. AgroConnect enforces an immutable 4-stage smart escrow where the buyer locks 50% advance before transit and releases the remaining 50% only upon authenticated APMC gate weighment.",
        "Guaranteed 4-Stage Escrow vs. Open Settlement Risk: ")

    format_bullet(doc.add_paragraph(), 
        "Conventional apps display raw mandi modal rates without logistics economics. AgroConnect embeds a Haversine GIS engine computing real-time freight (₹22/km), statutory APMC cess (1.05%), and labor handling (₹45/Qtl), revealing the exact Net Take-Home realization (₹/Qtl) before dispatch.",
        "GIS Logistics Arbitrage vs. Superficial Price Feeds: ")

    format_bullet(doc.add_paragraph(), 
        "Unlike static classifieds or informal mandi bids, AgroConnect provides an interactive counter-bidding console with automatic deal valuation splits, instantly executing legally enforceable digital contracts under the Maharashtra APMC Act, 1963 via Aadhaar OTP and digital token authentication.",
        "Enforceable Digital Contracts vs. Informal Commission Listings: ")

    format_bullet(doc.add_paragraph(), 
        "Unregulated commission agents frequently apply subjective quality cuts under the guise of moisture or foreign matter. AgroConnect integrates NABL laboratory assay certificates, tamper-evident QR traceability tags, and a 3-tier statutory arbitration tribunal (Peer Review → APMC Secretary → MSAMB State Panel).",
        "Statutory 3-Tier Arbitration vs. Unregulated Middleman Deductions: ")

    add_callout(doc, "Unique Selling Proposition (USP)",
        "\"AgroConnect is a unified, bilingual agritech exchange that replaces opaque intermediary cartels with real-time APMC price telemetry, GIS logistics arbitrage, 4-stage smart escrow, and legally binding statutory dispute redressal under the Maharashtra APMC Act, 1963.\"",
        bg_hex="F0F7FF", border_hex="1B365D")

    # Clean Page Break -> Leads cleanly to Page 2
    doc.add_page_break()

    # =========================================================================
    # PAGE 2: TECHNICAL APPROACH (Compact, side-by-side components)
    # =========================================================================
    format_h1(doc.add_paragraph(), "3. Technical Approach")
    
    format_h2(doc.add_paragraph(), "Core Technology Stack (Pure Supabase Serverless Architecture)")
    format_body(doc.add_paragraph(), 
        "AgroConnect eliminates server maintenance, cold starts, and architectural duplicity by deploying Supabase Cloud as its sole backend engine paired with an ultra-lightweight React 19 client:",
        "Architectural Strategy: ")

    # 2-column compact table for Core Tech Stack
    tech_table = doc.add_table(rows=3, cols=2)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_w_tech = [Inches(3.55), Inches(3.55)]
    set_table_borders(tech_table, color="CBD5E1", sz="4")

    tech_items = [
        (("Client Application", ": React 19 (^19.0.0), TypeScript (~5.7.2), Vite (^6.2.0); ~310ms build, <1.5s load on 3G, sub-100ms latency."),
         ("Managed Database", ": PostgreSQL 15 housing 8 core relational tables with foreign keys and trigram search indices.")),
        (("Row-Level Security (RLS)", ": Strict persona isolation; farmers edit only own lots, buyers access only their bids, officials arbitrate."),
         ("Realtime WebSockets", ": Multiplexed channels for live APMC price feeds, bilateral RFQ counter-bidding, and escrow transitions.")),
        (("Supabase Object Storage", ": Encrypted storage for NABL laboratory assay certificates, APMC gate weighment slips, and dispute evidence."),
         ("Edge Functions & Triggers", ": Deno runtime executing automated contract ID generation (AGC-MH-YYYYMMDD-XXXXX) and notifications."))
    ]

    for idx, (left_item, right_item) in enumerate(tech_items):
        row = tech_table.rows[idx]
        make_row_cant_split(row)
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        for c_idx, item in enumerate([left_item, right_item]):
            cell = row.cells[c_idx]
            cell.width = col_w_tech[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=35, bottom=35, left=70, right=70)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.06
            r1 = p.add_run(item[0])
            r1.font.name = "Arial"
            r1.font.size = Pt(7.9)
            r1.font.bold = True
            r1.font.color.rgb = RGBColor(30, 41, 59)
            r2 = p.add_run(item[1])
            r2.font.name = "Arial"
            r2.font.size = Pt(7.9)
            r2.font.color.rgb = RGBColor(51, 65, 85)

    format_h2(doc.add_paragraph(), "Methodology & End-to-End Transaction Process Flow")
    format_bullet(doc.add_paragraph(), "Farmer/FPO registers produce specifying commodity, variety (e.g., Garwa Onion, JS-335 Soybean), volume (Qtl), moisture %, asking rate, and storage coordinates. Validated against APMC Modal Parity; issues official printable QR traceability badge.", "1. Harvest Lot Registration: ")
    format_bullet(doc.add_paragraph(), "System maps coordinates across 585+ APMCs, factoring commercial freight, mandi cess, and handling to display real-time inter-market arbitrage margins.", "2. Telemetry & Arbitrage Check: ")
    format_bullet(doc.add_paragraph(), "Institutional buyer explores certified lots and initiates bilateral counter-offers. Platform auto-computes Total Deal Value and 50/50 advance milestones.", "3. Bilateral RFQ Counter-Bidding: ")
    format_bullet(doc.add_paragraph(), "Mutual acceptance auto-generates a legally binding contract under the APMC Act 1963, verified via Aadhaar OTP (farmer) and digital key (buyer).", "4. Digital Contract Execution: ")
    format_bullet(doc.add_paragraph(), "Escrow state machine locks buyer advance; transit dispatch triggers advance release to farmer; terminal gate weighment releases the balance.", "5. 4-Stage Milestone Escrow: ")
    format_bullet(doc.add_paragraph(), "Any quality or moisture discrepancy is routed through 48h peer negotiation, APMC Secretary arbitration, or the MSAMB state panel with photographic evidence.", "6. 3-Tier Statutory Arbitration: ")

    format_h2(doc.add_paragraph(), "System Architecture Diagram Description")
    format_body(doc.add_paragraph(), 
        "The architecture decouples the Vite React 19 client from Supabase Cloud services. The SPA communicates directly with PostgreSQL via auto-generated PostgREST HTTP/2 APIs and WebSocket channels, backed by in-memory reactive fallback engines to guarantee zero demo interruption during transient offline intervals.",
        "Structural Blueprint: ")

    add_callout(doc, "Architecture Representation (Client-to-Cloud)",
        "[Client: Vite + React 19 + TypeScript (Marathi/English i18n)]\n"
        "   │  • Farmer Portal   • Buyer Catalog   • Mandi Arbitrage   • Escrow Hub   • Dispute Court\n"
        "   ▼  (Direct @supabase/supabase-js over PostgREST HTTP/2 & Realtime WebSockets)\n"
        "[Supabase Cloud Backend Services]\n"
        "   ├── PostgreSQL 15 DB (8 Core Relational Tables + Trigram Indices)\n"
        "   ├── Row-Level Security (RLS) Engine (Persona-based Data Isolation)\n"
        "   ├── Realtime Engine (WebSockets for Prices, RFQ Counter-Bids, Escrow Events)\n"
        "   ├── Object Storage (NABL Assay Reports, APMC Gate Weighment Evidence, QR Tags)\n"
        "   └── Database Triggers & Edge Functions (Contract Auto-Gen & Audit Logs)",
        bg_hex="F8FAFC", border_hex="2B6CB0")

    # Side-by-side Table for Haversine Formula & Escrow State Machine
    side_table = doc.add_table(rows=1, cols=2)
    side_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_w_side = [Inches(3.55), Inches(3.55)]
    make_row_cant_split(side_table.rows[0])

    # Left Cell: Haversine
    c_left = side_table.rows[0].cells[0]
    c_left.width = col_w_side[0]
    set_cell_background(c_left, "F0FDF4")
    set_cell_margins(c_left, top=45, bottom=45, left=70, right=70)
    p_hl = c_left.paragraphs[0]
    p_hl.paragraph_format.space_before = Pt(0)
    p_hl.paragraph_format.space_after = Pt(1)
    r_hlt = p_hl.add_run("Haversine GIS Formula & Realization")
    r_hlt.font.name = "Arial"
    r_hlt.font.size = Pt(8.2)
    r_hlt.font.bold = True
    r_hlt.font.color.rgb = RGBColor(22, 101, 52)
    
    p_hlb = c_left.add_paragraph()
    p_hlb.paragraph_format.space_before = Pt(0)
    p_hlb.paragraph_format.space_after = Pt(0)
    p_hlb.paragraph_format.line_spacing = 1.05
    r_hlbt = p_hlb.add_run(
        "Distance (d) = 2R · arcsin(√(sin²(Δφ/2) + cos(φ1)cos(φ2)sin²(Δλ/2)))\n"
        "Earth R = 6,371 km; Δφ = φ2 - φ1; Δλ = λ2 - λ1\n\n"
        "• Freight Cost = Distance (km) × ₹22 / km\n"
        "• APMC Market Cess = 1.05% of Gross Consignment Value\n"
        "• Labor & Handling = Quantity (Qtl) × ₹45 / Qtl\n"
        "Net Take-Home (₹/Qtl) = [Gross - (Freight+Cess+Labor)] / Qtl"
    )
    r_hlbt.font.name = "Arial"
    r_hlbt.font.size = Pt(7.5)
    r_hlbt.font.color.rgb = RGBColor(20, 83, 45)

    # Right Cell: Escrow State Machine
    c_right = side_table.rows[0].cells[1]
    c_right.width = col_w_side[1]
    set_cell_background(c_right, "F8FAFC")
    set_cell_margins(c_right, top=45, bottom=45, left=70, right=70)
    p_hr = c_right.paragraphs[0]
    p_hr.paragraph_format.space_before = Pt(0)
    p_hr.paragraph_format.space_after = Pt(1)
    r_hrt = p_hr.add_run("4-Stage Escrow Milestone State Machine")
    r_hrt.font.name = "Arial"
    r_hrt.font.size = Pt(8.2)
    r_hrt.font.bold = True
    r_hrt.font.color.rgb = RGBColor(27, 54, 93)

    p_hrb = c_right.add_paragraph()
    p_hrb.paragraph_format.space_before = Pt(0)
    p_hrb.paragraph_format.space_after = Pt(0)
    p_hrb.paragraph_format.line_spacing = 1.05
    r_hrbt = p_hrb.add_run(
        "[1. E-Signatures Completed] (Aadhaar OTP + Buyer Token)\n"
        "               │\n"
        "               ▼\n"
        "[2. 50% Advance Escrow Locked] (Buyer deposits 50%)\n"
        "               │\n"
        "               ▼\n"
        "[3. Produce Dispatched] (Transit active; 50% released to farmer)\n"
        "               │\n"
        "               ▼\n"
        "[4. APMC Gate Weighment & Final Payout] (Balance released)"
    )
    r_hrbt.font.name = "Arial"
    r_hrbt.font.size = Pt(7.5)
    r_hrbt.font.color.rgb = RGBColor(30, 41, 59)

    # Set side table borders
    tblPr_st = side_table._tbl.tblPr
    borders_st = parse_xml(f'<w:tblBorders {nsdecls("w")}>'
                          f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                          f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                          f'<w:left w:val="single" w:sz="16" w:space="0" w:color="1B365D"/>'
                          f'<w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                          f'<w:insideH w:val="none"/>'
                          f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                          f'</w:tblBorders>')
    tblPr_st.append(borders_st)

    # Clean Page Break -> Leads cleanly to Page 3
    doc.add_page_break()

    # =========================================================================
    # PAGE 3: FEASIBILITY AND VIABILITY
    # =========================================================================
    format_h1(doc.add_paragraph(), "4. Feasibility and Viability")
    
    format_h2(doc.add_paragraph(), "Multi-Pillar Feasibility Analysis")
    
    feas_table = doc.add_table(rows=5, cols=2)
    feas_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_w_feas = [Inches(1.8), Inches(5.3)]
    set_table_borders(feas_table, color="CBD5E1", sz="4")
    format_table_header(feas_table.rows[0], col_w_feas, ["Feasibility Dimension", "Implementation & Non-Functional Verification"])

    feas_rows = [
        (("Technical Feasibility", ""), 
         "Built on production-grade Supabase managed PostgreSQL and Vite React 19. Initial page loads achieve <1.5s on rural 3G networks; UI response latency remains sub-100ms. Bundle compilation clocks in at ~310ms. Integrated in-memory reactive fallback engine guarantees 100% demo uptime and resilient offline execution during network drops."),
        (("Operational Feasibility", ""), 
         "Seamlessly maps to established mandi operations under the Maharashtra APMC Act, 1963. Features complete bilingual English and Marathi (मराठी) parity. Persona-aware interfaces tailored for Farmers, Corporate Buyers, APMC Secretaries, and MSAMB Panelists streamline adoption without operational friction."),
        (("Economic Feasibility", ""), 
         "Serverless cloud deployment completely eliminates high infrastructure capex and ongoing database maintenance costs. Eliminates multi-layered middleman markups (20–35%), while preserving the statutory 1.05% APMC market cess to sustain state infrastructure. 50% advance escrow eliminates working capital credit default risk."),
        (("Social Feasibility", ""), 
         "Directly targets smallholders and FPOs who historically suffer price asymmetry and distress selling. Vernacular localization, transparent NABL assay metrics, and time-bound statutory dispute arbitration restore commercial trust, protecting vulnerable farmers from local commission cartels.")
    ]

    for idx, (dim, desc) in enumerate(feas_rows):
        style_data_row(feas_table.rows[idx + 1], col_w_feas, [dim, desc], is_even=(idx % 2 == 1))

    format_h2(doc.add_paragraph(), "Risk Awareness & Concrete Mitigation Strategies")
    format_body(doc.add_paragraph(), 
        "A successful statewide rollout must address practical ground-level friction. The table below outlines key operational risks and AgroConnect's concrete mitigation mechanisms:")

    risk_table = doc.add_table(rows=5, cols=3)
    risk_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_w_risk = [Inches(1.8), Inches(2.2), Inches(3.1)]
    set_table_borders(risk_table, color="CBD5E1", sz="4")
    format_table_header(risk_table.rows[0], col_w_risk, ["Potential Challenge", "Operational Vulnerability", "Concrete Mitigation Strategy"])

    risk_rows = [
        (("Farmer Digital Literacy", ""), 
         "Smallholders may hesitate navigating complex digital interfaces.",
         "Full Marathi vernacular localization, high-contrast crop icons, simplified 3-step lot listing, FPO lead-delegated aggregation, and physical printable QR lot tags."),
        (("Rural Network Connectivity", ""), 
         "Intermittent or degraded 2G/3G mobile data connectivity in remote villages.",
         "Lightweight Vite SPA architecture (<350KB gzip), sub-1.5s load time, local caching, and an automated in-memory reactive fallback engine that buffers inputs offline and auto-syncs on reconnect."),
        (("Buyer Trust & Quality Verification", ""), 
         "Institutional buyers fear quality variance or moisture discrepancies at farmgate.",
         "Integration of NABL-accredited laboratory assay certificates, tamper-evident QR lot tags, and 50% escrow retention until physical APMC gate weighment and inspection sign-off."),
        (("Government API Latency & Anomalies", ""), 
         "Spurious reporting or latency spikes from public mandi price feeds.",
         "Automated Interquartile Range (IQR) outlier sanitization filter to purge anomalous price spikes, combined with multi-source validation across Agmarknet, eNAM, and MSAMB.")
    ]

    for idx, (chal, vuln, mit) in enumerate(risk_rows):
        style_data_row(risk_table.rows[idx + 1], col_w_risk, [chal, vuln, mit], is_even=(idx % 2 == 1))

    # Clean Page Break -> Leads cleanly to Page 4
    doc.add_page_break()

    # =========================================================================
    # PAGE 4: IMPACT AND BENEFITS & RESEARCH AND REFERENCES
    # =========================================================================
    format_h1(doc.add_paragraph(), "5. Impact and Benefits")
    
    format_body(doc.add_paragraph(), 
        "AgroConnect generates quantifiable value across economic, social, environmental, and governance domains. Projections reflect targeted field outcomes based on official APMC baselines, while platform capabilities reflect fully implemented and demonstrable software systems:")

    impact_table = doc.add_table(rows=5, cols=3)
    impact_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_w_imp = [Inches(1.6), Inches(2.5), Inches(3.0)]
    set_table_borders(impact_table, color="CBD5E1", sz="4")
    format_table_header(impact_table.rows[0], col_w_imp, ["Impact Category", "Key Outcome & Quantitative Metric", "Classification & Operational Mechanism"])

    impact_rows = [
        (("Economic Impact", ""), 
         "• 15% to 25% Increase in Farmgate Price Realization\n• Zero (0%) Counterparty Payment Defaults\n• Elimination of 20–35% Middleman Margin Extraction",
         "[Target / Projected Field Outcome] via direct institutional linkage.\n[Implemented Platform Capability] guaranteed through 4-stage smart escrow milestone locking."),
        (("Social & Rural Impact", ""), 
         "• Elimination of Distress Selling Below MSP\n• Formal Financial Inclusion via Digital Sales Ledgers\n• Equitable Bargaining Power for FPOs",
         "[Target / Projected Field Outcome] through modal parity alerts.\n[Implemented Platform Capability] with tamper-evident digital contracts and printable QR lot audit trails."),
        (("Agricultural & Environmental", ""), 
         "• Reduced Post-Harvest Transit Spoilage\n• Direct Farmgate-to-Processor Freight Routing\n• Lower Logistics Carbon Footprint per Quintal",
         "[Target / Projected Field Outcome] by eliminating unnecessary multi-hop mandi haulage.\n[Implemented Platform Capability] via Haversine GIS distance and freight optimizer."),
        (("Technological & Governance", ""), 
         "• 100% Real-Time Visibility Across 585+ APMCs\n• Automated 1.05% Statutory Mandi Cess Tracking\n• Fully Traceable Statutory Dispute Redressal",
         "[Implemented Platform Capability] live WebSocket telemetry.\n[Implemented Platform Capability] auto-deducted statutory compliance under the Maharashtra APMC Act, 1963.")
    ]

    for idx, (cat, met, mech) in enumerate(impact_rows):
        style_data_row(impact_table.rows[idx + 1], col_w_imp, [cat, met, mech], is_even=(idx % 2 == 1))

    format_h1(doc.add_paragraph(), "6. Research and References")
    
    format_body(doc.add_paragraph(), 
        "AgroConnect's data ingestion pipelines, economic benchmarks, and regulatory logic are anchored directly in official Government of India and Government of Maharashtra institutional systems:")

    ref_table = doc.add_table(rows=8, cols=3)
    ref_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    col_w_ref = [Inches(1.4), Inches(2.4), Inches(3.3)]
    set_table_borders(ref_table, color="CBD5E1", sz="4")
    format_table_header(ref_table.rows[0], col_w_ref, ["Data Source / Body", "Official Portal URL", "Platform Function & Operational Role"])

    ref_rows = [
        (("Agmarknet", " (DMI, MoA&FW)"), 
         "https://agmarknet.gov.in", 
         "Live daily arrivals, modal, minimum, and maximum wholesale commodity prices across regulated agricultural markets; feeds the real-time telemetry engine."),
        (("CACP", " (MoA&FW)"), 
         "https://cacp.dacnet.nic.in", 
         "Official Minimum Support Price (MSP) benchmarks and crop cost of cultivation metrics (A2, A2+FL, C2) used for modal parity distress sell prevention."),
        (("eNAM", " (MoA&FW / SFAC)"), 
         "https://enam.gov.in", 
         "National agricultural market trade benchmarks, unified national commodity classifications, and inter-state trade corridor references."),
        (("MSAMB", " (Govt of Maharashtra)"), 
         "https://www.msamb.com", 
         "Telemetry covering 585+ Maharashtra APMCs, 1.05% market cess regulatory schedules, export guidelines, and state warehouse infrastructure."),
        (("IMD Agromet", " (MoES)"), 
         "https://imdagrimet.gov.in\n(https://mausam.imd.gov.in)", 
         "Localized agrometeorological advisories, rainfall schedules, and temperature anomalies used to forecast supply disruptions and transit risk."),
        (("DGFT", " (Ministry of Commerce)"), 
         "https://dgft.gov.in", 
         "Export-import trade tariffs, quota notifications, and Minimum Export Price (MEP) benchmarks that influence domestic market price trends."),
        (("WDRA", " (Dept of Food & Public Dist)"), 
         "https://wdra.gov.in", 
         "Accredited warehouse registry standards and Electronic Negotiable Warehouse Receipt (e-NWR) norms to support safe post-harvest holding.")
    ]

    for idx, (src, url, role) in enumerate(ref_rows):
        style_data_row(ref_table.rows[idx + 1], col_w_ref, [src, url, role], is_even=(idx % 2 == 1))

    format_h2(doc.add_paragraph(), "Statutory & Legal Framework Citation")
    format_bullet(doc.add_paragraph(), 
        "All digital purchase agreements, bilateral counter-offers, and dispute arbitrations within AgroConnect strictly adhere to the Maharashtra Agricultural Produce Marketing (Regulation) Act, 1963 (alongside state market reforms including Maharashtra Act No. VII of 2017). This guarantees legal enforceability of digital contracts, formalizes APMC market committee arbitration authority, and ensures statutory compliance for the 1.05% mandi market cess.",
        "Primary Regulatory Foundation: ")

    p_final = doc.add_paragraph()
    p_final.paragraph_format.space_before = Pt(8)
    p_final.paragraph_format.space_after = Pt(2)
    p_final.paragraph_format.keep_with_next = True
    r_tid = p_final.add_run("Team ID: ___________________________")
    r_tid.font.name = "Arial"
    r_tid.font.size = Pt(9.5)
    r_tid.font.bold = True
    r_tid.font.color.rgb = RGBColor(27, 54, 93)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.save(output_path)
    print(f"Successfully generated updated SIH DPR document at: {output_path}")

if __name__ == "__main__":
    out_file = r"c:\Users\samsr\GitHub\SIH-problem-statement\docs\SIH26132_Detailed_Project_Report_AgroConnect.docx"
    build_sih_dpr(out_file)
