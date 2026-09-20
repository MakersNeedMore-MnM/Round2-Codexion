// Sample demo data for demonstration of role-based document access, verified calculations, and deliverable workflows.
// NOTE: These are synthetic engineering demonstration records, not actual plant records.
// Clearly labeled as: "Sample demo data — not real records"

export const userRoles = [
  {
    id: 'admin',
    name: 'Admin',
    title: 'Chief Plant Administrator & Security Officer',
    department: 'Executive Operations & Compliance',
    clearanceLevel: 4,
    clearanceBadge: 'Full System Authority',
    description: 'Full access to all document categories, all tasks, the audit ledger, the sovereignty monitor, and user/session management. Can see everything every other role can see.',
    avatar: 'AD',
    color: '#059669',
    accessibleCategories: [
      'P&IDs and Engineering Drawings',
      'SOPs (Standard Operating Procedures)',
      'Maintenance Reports',
      'Inspection Reports',
      'Technical Manuals',
      'Operational Reports',
      'Excel/Spreadsheet Data',
      'Internal Correspondence'
    ],
    categoryKeys: [
      'pid_drawings',
      'sop',
      'maintenance',
      'inspection',
      'technical_manual',
      'operational_report',
      'spreadsheet',
      'correspondence'
    ],
    canUpload: true,
    canApproveSensitive: true,
    canSignOffTasks: true,
    canViewAudit: true,
    canViewSovereignty: true
  },
  {
    id: 'engineer',
    name: 'Engineer',
    title: 'Process & Reliability Lead Engineer',
    department: 'Engineering & Maintenance',
    clearanceLevel: 3,
    clearanceBadge: 'Technical & Engineering',
    description: 'Access to technical/operational documents needed for day-to-day engineering work: P&IDs and engineering drawings, SOPs, maintenance reports, inspection reports, technical manuals, operational reports, and spreadsheet data. Cannot see internal correspondence.',
    avatar: 'EN',
    color: '#10243E',
    accessibleCategories: [
      'P&IDs and Engineering Drawings',
      'SOPs (Standard Operating Procedures)',
      'Maintenance Reports',
      'Inspection Reports',
      'Technical Manuals',
      'Operational Reports',
      'Excel/Spreadsheet Data'
    ],
    categoryKeys: [
      'pid_drawings',
      'sop',
      'maintenance',
      'inspection',
      'technical_manual',
      'operational_report',
      'spreadsheet'
    ],
    canUpload: true,
    canApproveSensitive: true,
    canSignOffTasks: true,
    canViewAudit: false,
    canViewSovereignty: true
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    title: 'Compliance & Quality Assurance Reviewer',
    department: 'Quality Assurance & Regulatory Oversight',
    clearanceLevel: 3,
    clearanceBadge: 'Compliance & Review',
    description: 'Access to documents that need review/approval — inspection reports, maintenance reports, and internal correspondence — with the ability to approve or reject flagged sensitive content during document review. Cannot see P&IDs/engineering drawings.',
    avatar: 'RV',
    color: '#F2A104',
    accessibleCategories: [
      'Inspection Reports',
      'Maintenance Reports',
      'Internal Correspondence'
    ],
    categoryKeys: [
      'inspection',
      'maintenance',
      'correspondence'
    ],
    canUpload: false,
    canApproveSensitive: true,
    canSignOffTasks: true,
    canViewAudit: true,
    canViewSovereignty: false
  },
  {
    id: 'viewer',
    name: 'Viewer',
    title: 'Operations Station Observer',
    department: 'General Operations (Read-Only)',
    clearanceLevel: 1,
    clearanceBadge: 'General Operations',
    description: 'Read-only, narrow access — SOPs and general operational reports only. Cannot upload, cannot approve sensitive content, cannot see maintenance/inspection reports, correspondence, or drawings.',
    avatar: 'VW',
    color: '#527593',
    accessibleCategories: [
      'SOPs (Standard Operating Procedures)',
      'Operational Reports'
    ],
    categoryKeys: [
      'sop',
      'operational_report'
    ],
    canUpload: false,
    canApproveSensitive: false,
    canSignOffTasks: false,
    canViewAudit: false,
    canViewSovereignty: false
  }
];

export const initialDocuments = [
  // 1. P&IDs and Engineering Drawings (Category: pid_drawings)
  // Allowed: Admin, Engineer. (Reviewer: NO. Viewer: NO)
  {
    id: 'doc-pid-4100',
    filename: 'PID-4100-CRUDE-DISTILLATION-TRAIN-B.dwg',
    originalName: 'PID-4100-CRUDE-DISTILLATION-TRAIN-B.dwg',
    category: 'pid_drawings',
    categoryLabel: 'P&IDs and Engineering Drawings',
    fileType: 'image/svg+xml',
    sizeBytes: 3145728,
    pageCount: 1,
    classificationLevel: 2,
    classificationLabel: 'Process Engineering Schematic',
    isDemo: true,
    demoLabel: 'Sample demo data — not real records',
    allowedRoles: ['admin', 'engineer'],
    uploadedBy: 'Lead Drafting Engineer K. Tanaka',
    uploadDate: '2026-09-18T10:30:00Z',
    status: 'INDEXED',
    summary: 'Piping & Instrumentation Diagram for Atmospheric Crude Distillation Train B, showing Charge Heater H-101, Column T-101, Reflux Loops, and Relief Header.',
    stages: {
      format: { status: 'COMPLETED', label: 'Vector CAD / Schematics Validated' },
      ocr: { status: 'COMPLETED', label: '142 Process Tags & 18 Nozzle Labels Parsed' },
      classification: { status: 'COMPLETED', label: 'Tagged P&IDs and Engineering Drawings' },
      indexing: { status: 'COMPLETED', label: '48 Chunks Stored in Local Database' }
    },
    sections: [
      {
        title: '1.0 Drawing Header, Design Codes & Revision History',
        page: 1,
        content: `Drawing Tag: DWG-4100-B-REV4 (Atmospheric Crude Distillation Train B).
Facility: Complex 01 Refining Unit & Fractionation Area.
Design Standard: ASME B31.3 Chemical Plant & Petroleum Refinery Piping.
Piping Class: CS-600# (ASTM A106 Gr B Carbon Steel).
Design Operating Pressure: 34.5 bar (500 psig) @ 260°C.
Relief Scenario: Overpressure protection routed to 24" Low-Pressure Wet Flare Header FL-01.`
      },
      {
        title: '2.0 Crude Charge Heater H-101 & Flash Zone Interconnect',
        page: 1,
        content: `Process Flow: Desalted crude oil enters radiant tubes of Heater H-101 at 215°C.
Heater Outlet Line: 14" Crude transfer line 14-CR-0101-CS-600# insulated with 75mm calcium silicate.
Flash Zone Nozzle N-1: 14" 600# ANSI RF flanged entry directly onto Tray 4 vapor distributor.
Stripping Steam: 3" Superheated stripping steam line 3-STM-0402 with check valve CV-104 and orifice flow meter FE-204.`
      },
      {
        title: '3.0 Overhead Vapor, Condenser Loops & Reflux Line',
        page: 1,
        content: `Column Overhead Nozzle N-2: 24" vapor line 24-VAP-0102 routed to Air Fin Coolers AC-101A/B.
Primary Relief: Safety relief valve PSV-101A (set 4.5 barg) and PSV-101B (set 4.8 barg) staggered pop setting.
Reflux Return: 8" liquid reflux line from Accumulator V-102 via Reflux Pumps P-104A/B to Column Tray 38.
Control Loop: Flow control valve FCV-108 modulated by Column top temperature controller TIC-102.`
      }
    ]
  },

  // 2. SOPs (Standard Operating Procedures) (Category: sop)
  // Allowed: Admin, Engineer, Viewer. (Reviewer: NO)
  {
    id: 'doc-sop-240',
    filename: 'SOP-OPS-240-HOT-REFLUX-STARTUP.pdf',
    originalName: 'SOP-OPS-240-HOT-REFLUX-STARTUP.pdf',
    category: 'sop',
    categoryLabel: 'SOPs (Standard Operating Procedures)',
    fileType: 'application/pdf',
    sizeBytes: 1245000,
    pageCount: 12,
    classificationLevel: 1,
    classificationLabel: 'Standard Operating Procedure',
    isDemo: true,
    demoLabel: 'Sample demo data — not real records',
    allowedRoles: ['admin', 'engineer', 'viewer'],
    uploadedBy: 'Operations Superintendent D. Kowalski',
    uploadDate: '2026-09-17T08:00:00Z',
    status: 'INDEXED',
    summary: 'Standard operating procedure for crude atmospheric distillation tower hot reflux circulation and thermal ramp-up.',
    stages: {
      format: { status: 'COMPLETED', label: 'PDF Native Format Validated' },
      ocr: { status: 'COMPLETED', label: '12 Pages Parsed / Step Sequences Verified' },
      classification: { status: 'COMPLETED', label: 'Tagged Standard Operating Procedure' },
      indexing: { status: 'COMPLETED', label: '36 Chunks Stored in Local Database' }
    },
    sections: [
      {
        title: '1.0 Purpose & Prerequisite System State',
        page: 1,
        content: `Document ID: SOP-OPS-240 Rev 3.2.
Scope: Governs safe initiation of hot reflux circulation across Atmospheric Distillation Column T-101.
Prerequisites:
1. Fuel gas blanket verified on Overhead Receiver V-102 at 0.35 barg.
2. Desalter electrostatic grid energized and crude oil bottoms temperature stabilized at 135°C.
3. Instrument air headers pressurized to 7.0 bar gauge with dewpoint below -40°C.
4. Flare header water seal level verified at normal operating limit.`
      },
      {
        title: '2.0 Step-by-Step Reflux Valve Sequencing & Pump Startup',
        page: 4,
        content: `Step 2.1: Line up suction valve MOV-201A on Reflux Pump P-104A and confirm minimum flow bypass is 100% open.
Step 2.2: Prime seal barrier fluid reservoir (API Plan 53B) to 5.2 barg nitrogen blanket.
Step 2.3: Start electric motor driver on P-104A. Verify discharge pressure stabilizes between 9.5 and 10.2 barg.
Step 2.4: Slowly open reflux flow control valve FCV-108 in manual mode at 5% increments every 3 minutes to avoid thermal shock to Tray 38 bubble caps.
Step 2.5: Switch FCV-108 to cascade automatic control once Column overhead vapor temperature reaches 98°C.`
      },
      {
        title: '3.0 Emergency Hold Points & Operating Safety Margins',
        page: 8,
        content: `HOLD POINT A: If column differential pressure (PDT-104) rises above 0.28 bar, immediately stop feed increase.
HOLD POINT B: Top tray temperature must not exceed 135°C during initial 30 minutes of hydrocarbon introduction.
HOLD POINT C: Liquid level in Overhead Accumulator V-102 must remain between 40% and 65% indicated span.
Emergency Action: In event of reflux pump trip, fail-safe close FCV-108 and activate emergency quench line Q-01.`
      }
    ]
  },

  // 3. Maintenance Reports (Category: maintenance)
  // Allowed: Admin, Engineer, Reviewer. (Viewer: NO)
  {
    id: 'doc-mr-p102a',
    filename: 'MR-2026-088-CRUDE-PUMP-P102A-SEAL-FAILURE.pdf',
    originalName: 'MR-2026-088-CRUDE-PUMP-P102A-SEAL-FAILURE.pdf',
    category: 'maintenance',
    categoryLabel: 'Maintenance Reports',
    fileType: 'application/pdf',
    sizeBytes: 1845000,
    pageCount: 16,
    classificationLevel: 2,
    classificationLabel: 'Mechanical Maintenance Work Order',
    isDemo: true,
    demoLabel: 'Sample demo data — not real records',
    allowedRoles: ['admin', 'engineer', 'reviewer'],
    uploadedBy: 'Machinery Specialist E. Gomez',
    uploadDate: '2026-09-16T14:15:00Z',
    status: 'INDEXED',
    summary: 'Corrective maintenance report on Crude Feed Pump P-102A mechanical seal leakage and drive end bearing replacement.',
    stages: {
      format: { status: 'COMPLETED', label: 'PDF Stream & Inspection Photos Validated' },
      ocr: { status: 'COMPLETED', label: '16 Pages Extracted / Alignment Data Parsed' },
      classification: { status: 'COMPLETED', label: 'Tagged Maintenance Report' },
      indexing: { status: 'COMPLETED', label: '44 Chunks Stored in Local Database' }
    },
    sections: [
      {
        title: '1.0 Equipment Tag & Work Order Summary',
        page: 1,
        content: `Work Order: WO-77401-MECH (Priority 1 Urgent Corrective).
Equipment Tag: P-102A (Atmospheric Column Crude Charge Pump).
Pump Model: Bingham-Willamette 6x8x13 MSD 5-stage between-bearing centrifugal pump.
Driver: 450 kW 3-phase induction motor (2980 RPM).
Work Description: Unplanned shutdown initiated after seal leakage detector alarm SLD-102A triggered in control room.`
      },
      {
        title: '2.0 Disassembly Inspection & Failure Root Cause',
        page: 5,
        content: `As-Found Condition: Drive-end cartridge mechanical seal showed severe face scoring and micro-fracturing.
Root Cause Analysis: API Plan 53B barrier fluid bladder accumulator nitrogen pre-charge pressure had decayed from 5.5 bar to 1.8 bar due to a faulty Schraeder fill valve.
This caused reverse pressure differential across inboard faces, leading to dry running and thermal heat checking on silicon carbide rotating face.
Shaft sleeve exhibited 0.04 mm fretting wear under secondary Viton O-ring.`
      },
      {
        title: '3.0 Corrective Overhaul, Dynamic Balancing & Recommissioning',
        page: 11,
        content: `Repairs Executed:
1. Installed brand-new John Crane Type 8648VRS dual pressurized cartridge seal with tungsten carbide vs silicon carbide faces.
2. Replaced drive end (DE) and non-drive end (NDE) SKF 7314 BECBM angular contact thrust bearings.
3. Performed laser shaft alignment to driver: Vertical offset = +0.02 mm, Horizontal angularity = 0.03 mm/100mm (within API 686 tolerance).
4. Rotor assembly dynamically balanced to ISO 1940 Grade G2.5; residual unbalance measured at 0.76 g-mm.
Post-Overhaul Run Test: Unfiltered overall vibration RMS measured at 1.85 mm/s on DE bearing housing (Zone A Good condition).`
      }
    ]
  },

  // 4. Inspection Reports (Category: inspection)
  // Allowed: Admin, Engineer, Reviewer. (Viewer: NO)
  // Contains realistic sensitive info (names, PE numbers, financial figures) for testing sensitive approval
  {
    id: 'doc-ir-ex102',
    filename: 'IR-2026-904-CRUDE-EXCHANGER-EX102-UT-SURVEY.pdf',
    originalName: 'IR-2026-904-CRUDE-EXCHANGER-EX102-UT-SURVEY.pdf',
    category: 'inspection',
    categoryLabel: 'Inspection Reports',
    fileType: 'application/pdf',
    sizeBytes: 2145000,
    pageCount: 18,
    classificationLevel: 2,
    classificationLabel: 'API 510 Asset Integrity Inspection Report',
    isDemo: true,
    demoLabel: 'Sample demo data — not real records',
    allowedRoles: ['admin', 'engineer', 'reviewer'],
    uploadedBy: 'Lead Inspector R. Vance',
    uploadDate: '2026-09-15T09:20:00Z',
    status: 'INDEXED',
    summary: 'Ultrasonic wall thickness inspection survey and remaining service life calculation for Crude Overhead Condenser EX-102.',
    stages: {
      format: { status: 'COMPLETED', label: 'PDF Vector Stream Validated' },
      ocr: { status: 'COMPLETED', label: '18 Pages Extracted / UT Grid Parsed' },
      classification: { status: 'COMPLETED', label: 'Tagged Inspection Report' },
      indexing: { status: 'COMPLETED', label: '58 Chunks Stored in Local Database' }
    },
    sections: [
      {
        title: '1.0 Equipment Identification & Design Baseline',
        page: 2,
        content: `Equipment Tag: EX-102 (Crude Distillation Column Overhead Shell-and-Tube Exchanger).
Design Code: ASME Boiler & Pressure Vessel Code Section VIII Division 1 & TEMA Class R.
Shell Material: SA-516 Gr 70 Carbon Steel normalized.
Design Pressure: 34.5 bar (500 psig) @ 245°C.
Nominal Original Shell Wall Thickness (T_nom): 9.52 mm (0.375 in).
Minimum Allowable Shell Thickness (T_min per ASME Sec VIII Div 1 equation): 4.80 mm.
Original Corrosion Allowance: 3.18 mm.`
      },
      {
        title: '2.0 Ultrasonic Thickness (UT) Survey Findings & Remaining Life',
        page: 6,
        content: `Inspection Date: September 10, 2026.
NDT Survey Lead: Lead Inspector R. Vance (Engineering License PE-TX-94810).
Inspection Method: Automated Ultrasonic Testing (AUT) using Olympus 38DL Plus dual element transducer.
Historical Readings:
- Baseline Commissioning (2021): 8.90 mm.
- Turnaround Inspection (2023): 7.30 mm.
- Current Survey Reading (Sept 2026): Lowest localized point = 6.20 mm (at shell bottom nozzle N2 invert).
Cumulative Metal Loss (2023-2026): 7.30 mm - 6.20 mm = 1.10 mm over 3.0 years.
Observed Corrosion Rate: 0.35 mm/year.
Calculated Available Margin: 6.20 mm - 4.80 mm = 1.40 mm.
Projected Remaining Operating Life: 1.40 mm / 0.35 mm/yr = 4.0 Years.
Mandatory Action: Shell spool section must be scheduled for replacement prior to the Q3 2030 turnaround window.`
      },
      {
        title: '3.0 Tube Bundle Metallurgy & Turnaround Budget Allocation',
        page: 12,
        content: `Tube Bundle Findings: 840 Titanium Grade 2 removable floating head tubes (19.05 mm OD x 1.24 mm wall).
Eddy Current Testing (ECT): Passes 1-3 indicate no wall loss. Pass 4 shows 12% ID erosion near baffle B-3, well below the mandatory 40% tube plugging threshold.
Financial Capital Projection:
Preliminary procurement estimate for new SA-516 Gr 70 replacement shell spool is $480,000.
Contractor turnaround overtime installation budget of $35,000 has been allocated for early mechanical contractor mobilization.`
      }
    ]
  },

  // 5. Technical Manuals (Category: technical_manual)
  // Allowed: Admin, Engineer. (Reviewer: NO. Viewer: NO)
  {
    id: 'doc-tm-sulzer',
    filename: 'TM-610-SULZER-CENTRIFUGAL-PUMP-OPERATIONS.pdf',
    originalName: 'TM-610-SULZER-CENTRIFUGAL-PUMP-OPERATIONS.pdf',
    category: 'technical_manual',
    categoryLabel: 'Technical Manuals',
    fileType: 'application/pdf',
    sizeBytes: 4580000,
    pageCount: 32,
    classificationLevel: 2,
    classificationLabel: 'Vendor Technical Equipment Manual',
    isDemo: true,
    demoLabel: 'Sample demo data — not real records',
    allowedRoles: ['admin', 'engineer'],
    uploadedBy: 'Reliability Engineering Group',
    uploadDate: '2026-09-14T11:00:00Z',
    status: 'INDEXED',
    summary: 'OEM technical operating manual and maintenance guide for API 610 BB2 between-bearing centrifugal process pumps.',
    stages: {
      format: { status: 'COMPLETED', label: 'PDF Document Format Validated' },
      ocr: { status: 'COMPLETED', label: '32 Pages Extracted / Curves Verified' },
      classification: { status: 'COMPLETED', label: 'Tagged Technical Manual' },
      indexing: { status: 'COMPLETED', label: '84 Chunks Stored in Local Database' }
    },
    sections: [
      {
        title: '1.0 Pump Design Specifications & Hydraulic Performance Curves',
        page: 3,
        content: `Pump Model: Sulzer GSG 80-260 4-Stage Between-Bearing Centrifugal Pump.
Standard Compliance: API 610 12th Edition Type BB2.
Rated Operating Flow: 420 m³/h at Best Efficiency Point (BEP: 78.5%).
Rated Head: 280 meters liquid column at rated 2980 RPM.
Minimum Continuous Stable Flow (MCSF): 95 m³/h (22.6% of BEP).
Net Positive Suction Head Required (NPSHr): 4.2 meters at rated flow.
Maximum Allowable Working Pressure (MAWP): 64 bar gauge at 250°C casing design rating.`
      },
      {
        title: '2.0 Lubrication Specifications & Thermal Limit Thresholds',
        page: 14,
        content: `Bearing Lubrication: ISO VG 46 high-grade synthetic turbine oil with rust and oxidation inhibitors.
Sump Capacity: 4.8 liters per bearing housing with constant level oiler set to center of lower ball.
Operating Temperature Limits:
- Normal Sump Operating Temperature: 55°C to 68°C.
- High Temperature Alarm Trigger: 82°C.
- High-High Temperature Automated Motor Trip Threshold: 95°C.
Lube Oil Sampling Interval: Oil sampling every 1,500 run hours; full fluid replacement every 4,000 run hours.`
      },
      {
        title: '3.0 Mechanical Seal Piping Plan Requirements (API 682)',
        page: 22,
        content: `Mechanical Seal Arrangement: Dual pressurized arrangement per API 682 Plan 53B.
Barrier Fluid: Synthetic polyalphaolefin (PAO) compatible with hydrocarbon process stream.
Nitrogen Pre-charge Calculation: Pre-charge pressure must be set to 0.9 x minimum operating barrier pressure.
Minimum Barrier Operating Pressure: Must maintain at least 1.5 bar (22 psi) above the maximum stuffing box pressure under all operating modes including startup and settled-out conditions.`
      }
    ]
  },

  // 6. Operational Reports (Category: operational_report)
  // Allowed: Admin, Engineer, Viewer. (Reviewer: NO)
  {
    id: 'doc-opr-daily',
    filename: 'OPR-2026-Q3-REFINERY-DAILY-RUN-SUMMARY.pdf',
    originalName: 'OPR-2026-Q3-REFINERY-DAILY-RUN-SUMMARY.pdf',
    category: 'operational_report',
    categoryLabel: 'Operational Reports',
    fileType: 'application/pdf',
    sizeBytes: 980000,
    pageCount: 8,
    classificationLevel: 1,
    classificationLabel: 'Daily Operations & Throughput Report',
    isDemo: true,
    demoLabel: 'Sample demo data — not real records',
    allowedRoles: ['admin', 'engineer', 'viewer'],
    uploadedBy: 'Shift Supervisor D. Kowalski',
    uploadDate: '2026-09-18T06:30:00Z',
    status: 'INDEXED',
    summary: 'Refinery Unit 01 & 02 daily production summary, crude unit yield fractions, and energy efficiency metrics.',
    stages: {
      format: { status: 'COMPLETED', label: 'PDF Native Format Validated' },
      ocr: { status: 'COMPLETED', label: '8 Pages Parsed / Yield Balances Verified' },
      classification: { status: 'COMPLETED', label: 'Tagged Operational Report' },
      indexing: { status: 'COMPLETED', label: '28 Chunks Stored in Local Database' }
    },
    sections: [
      {
        title: '1.0 Crude Throughput & Unit Operating Factor',
        page: 1,
        content: `Reporting Period: September 17, 2026 (06:00 to 06:00 24-hr cycle).
Crude Distillation Unit 1 (CDU-1) Daily Rate: 142,500 Barrels Per Stream Day (BPSD).
Operating Capacity Factor: 98.3% of nameplate rating.
Crude Slate Blend: 65% Light Sweet Domestic Crude (38.2° API, 0.42 wt% S), 35% Offshore Medium Sour (29.1° API, 1.45 wt% S).
Average Feed Specific Gravity: 0.842 @ 15.6°C.
Desalter Effluent Salt Content: 1.8 PTB (pounds per thousand barrels, target < 2.5 PTB).`
      },
      {
        title: '2.0 Product Yield Distribution & Cut Temperatures',
        page: 3,
        content: `Refinery Distillation Cut Yield Summary:
1. Fuel Gas & LPG: 3.2 vol% (Overhead gas compressor online).
2. Light Straight Run Naphtha (IBP - 95°C): 14.8 vol% (Routed to Isomerization).
3. Heavy Naphtha (95°C - 165°C): 18.4 vol% (Hydrotreater feed).
4. Kerosene / Jet A-1 Fuel (165°C - 235°C): 12.1 vol% (Freeze point: -48.2°C).
5. Ultra-Low Sulfur Diesel (235°C - 360°C): 34.6 vol% (Cetane index: 52.4).
6. Atmospheric Residue (360°C+ Bottoms): 16.9 vol% (Vacuum distillation unit feed).`
      },
      {
        title: '3.0 Utilities Consumption & Environmental Compliance',
        page: 6,
        content: `Fired Heater H-101 Thermal Efficiency: 89.2% (Stack O2 at 2.4%, Excess Air at 12%).
High Pressure Steam Consumption (62 bar): 18.2 metric tonnes per hour.
Cooling Water Circulation Rate: 4,200 m³/hr with supply at 26°C and return at 34.5°C (delta-T 8.5°C).
Environmental Stack Emissions:
- SO2 Concentration: 14.2 ppm (EPA Title V permit limit: 50.0 ppm).
- NOx Concentration: 28.5 ppm (SCR catalyst active).
- Continuous Emission Monitoring System (CEMS) status: 100% compliant, zero exceedances.`
      }
    ]
  },

  // 7. Excel / Spreadsheet Data (Category: spreadsheet)
  // Allowed: Admin, Engineer. (Reviewer: NO. Viewer: NO)
  {
    id: 'doc-sheet-sensor',
    filename: 'REFINERY-SENSORS-HOURLY-TELEMETRY-2026.xlsx',
    originalName: 'REFINERY-SENSORS-HOURLY-TELEMETRY-2026.xlsx',
    category: 'spreadsheet',
    categoryLabel: 'Excel/Spreadsheet Data',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    sizeBytes: 842000,
    pageCount: 6,
    classificationLevel: 2,
    classificationLabel: 'Process Telemetry & Sensor Log (Spreadsheet)',
    isDemo: true,
    demoLabel: 'Sample demo data — not real records',
    allowedRoles: ['admin', 'engineer'],
    uploadedBy: 'Process Control Engineer A. Sharma',
    uploadDate: '2026-09-17T12:00:00Z',
    status: 'INDEXED',
    summary: 'Atmospheric Tower Column T-101 Hourly Sensor Readings & Temp Profiles (Excel with 840 telemetry data points).',
    stages: {
      format: { status: 'COMPLETED', label: 'Office OpenXML Spreadsheet Validated' },
      ocr: { status: 'COMPLETED', label: '840 Sensor Rows / 6 Sheets Extracted' },
      classification: { status: 'COMPLETED', label: 'Tagged Spreadsheet Data' },
      indexing: { status: 'COMPLETED', label: '34 Chunks Stored in Local Database' }
    },
    sections: [
      {
        title: 'Sheet 1: Column T-101 Hourly Temperature Profile',
        page: 1,
        content: `Tag: T-101 Multistage Fractionator (Trays 1 through 40).
Columns: Hour, TI-101 (Flash Zone °C), TI-108 (Tray 12 °C), TI-115 (Tray 24 °C), TI-122 (Overhead Vapor °C), PI-101 (Top Press bar).
Representative Readings (Last 4 Hours):
- 00:00 | Flash Zone: 348.2°C | Tray 12: 242.1°C | Tray 24: 174.5°C | Overhead: 104.2°C | Press: 1.82 bar
- 04:00 | Flash Zone: 347.9°C | Tray 12: 241.8°C | Tray 24: 173.9°C | Overhead: 103.8°C | Press: 1.81 bar
- 08:00 | Flash Zone: 349.1°C | Tray 12: 243.0°C | Tray 24: 175.2°C | Overhead: 104.9°C | Press: 1.83 bar
- 12:00 | Flash Zone: 348.5°C | Tray 12: 242.4°C | Tray 24: 174.8°C | Overhead: 104.4°C | Press: 1.82 bar
Temperature Profile Gradient: Stable across all fractionation stages.`
      },
      {
        title: 'Sheet 2: Crude Unit Rotating Equipment Vibration FFT Telemetry',
        page: 2,
        content: `Machine Tag: P-102A (Crude Feed Pump) & P-102B (Hot Standby Pump).
Sensor Tag: VT-102A-DE (Drive End Horizontal Proximity Probe) & VT-102A-NDE (Non-Drive End).
Readings Summary:
- P-102A DE Journal RMS: 1.85 mm/s (Peak-to-Peak Displacement: 22.4 µm).
- P-102A NDE Journal RMS: 1.62 mm/s (Peak-to-Peak Displacement: 19.8 µm).
- Dominant Harmonic Peak: 1X Running Speed (49.7 Hz) at 1.4 mm/s RMS.
- 2X Harmonic: 0.35 mm/s RMS (Misalignment check acceptable).
- ISO 10816-3 Evaluation: Zone A / B boundary. Long-term continuous operation approved.`
      }
    ]
  },

  // 8. Internal Correspondence (Category: correspondence)
  // Allowed: Admin, Reviewer. (Engineer: NO. Viewer: NO)
  // Contains rich realistic sensitive info: names, financial figures, incident details, license/ID numbers, sensitivity keywords
  {
    id: 'doc-corr-flare',
    filename: 'MEMO-CORR-2026-INCIDENT-FLARE-EXCURSION-INVESTIGATION.pdf',
    originalName: 'MEMO-CORR-2026-INCIDENT-FLARE-EXCURSION-INVESTIGATION.pdf',
    category: 'correspondence',
    categoryLabel: 'Internal Correspondence',
    fileType: 'application/pdf',
    sizeBytes: 1540000,
    pageCount: 14,
    classificationLevel: 3,
    classificationLabel: 'Confidential Legal & Incident Correspondence',
    isDemo: true,
    demoLabel: 'Sample demo data — not real records',
    allowedRoles: ['admin', 'reviewer'],
    uploadedBy: 'Incident Review Committee',
    uploadDate: '2026-09-13T16:45:00Z',
    status: 'INDEXED',
    summary: 'Internal executive memorandum on August 2026 flaring excursion investigation, regulatory disclosure assessment, and legal reserve.',
    stages: {
      format: { status: 'COMPLETED', label: 'PDF Native Stream Validated' },
      ocr: { status: 'COMPLETED', label: '14 Pages Extracted / Sensitive Legal Annotations' },
      classification: { status: 'COMPLETED', label: 'Tagged Internal Correspondence' },
      indexing: { status: 'COMPLETED', label: '42 Chunks Stored in Local Database' }
    },
    sections: [
      {
        title: 'Memorandum Header & Attorney-Client Privileged Notice',
        page: 1,
        content: `MEMORANDUM — STRICTLY CONFIDENTIAL & PRIVILEGED ATTORNEY-CLIENT COMMUNICATION.
Date: September 12, 2026.
To: Director M. Chen (Executive Vice President of Refining Operations).
From: Incident Lead Dr. Sarah Jenkins (Senior Reliability & Legal Compliance Counsel).
Subject: Final Investigation Findings & Regulatory Penalty Evaluation — August 24 Flaring Excursion.
Distribution: Executive Directorate and Certified Reviewers only. Do not duplicate or distribute without legal clearance.`
      },
      {
        title: 'Incident Chronology, Employee Involvements & Root Cause',
        page: 4,
        content: `Incident Summary: On August 24, 2026 at 14:18 hours, an electrical bus transient caused a sudden trip of primary Instrument Air Compressor C-201.
The resulting instrument air header pressure drop triggered fail-open operation on column overhead relief valve PV-104, routing 2.1 MMSCF of hydrocarbon vapor to the main flare stack.
The flaring event lasted 42 minutes until Operator J. Miller (Employee ID ID-89412) manually isolated the secondary bypass manifold and restored instrument air from the auxiliary receiver.
No personnel injuries were sustained during the incident.
The incident review panel concluded that Operator J. Miller acted in full accordance with emergency operating procedure SOP-EM-08.`
      },
      {
        title: 'Regulatory Liability Assessment, Penalties & Remediation Budget',
        page: 9,
        content: `Environmental Compliance Review:
A formal self-disclosure notification has been submitted to state environmental regulators under Compliance Docket EPA-R6-2026-092.
Outside environmental legal counsel estimates potential statutory penalty fine of $250,000 for the SO2 emission threshold excursion.
An advisory retainer fee of $75,000 has been paid to regulatory counsel for administrative proceedings.
The risk committee recommends setting aside an environmental settlement fund reserve of $1,200,000 pending the final consent order.
Capital Remediation Requirement:
To prevent recurrences, engineering has scoped the mandatory installation of an automated diesel-driven backup air compressor.
The total capital remediation project cost is estimated at $480,000 with a completion target date of December 2026.`
      }
    ]
  }
];

export const prebuiltTaskTemplates = [
  {
    id: 'task-corrosion-ex102',
    title: 'Calculate EX-102 Remaining Wall Thickness Life & Draft Approval Note',
    goal: 'Analyze the ultrasonic thickness inspection report for Heat Exchanger EX-102. Calculate the annual corrosion rate from 2023 to 2026, compute remaining service life until T_min (4.80 mm), and draft a formal Mechanical Integrity Approval Note with citations.',
    recommendedRole: 'engineer',
    targetDocId: 'doc-ir-ex102',
    category: 'Wall Thickness & Service Life'
  },
  {
    id: 'task-mr-p102a',
    title: 'Review Crude Pump P-102A Mechanical Seal Overhaul & Vibration Acceptance',
    goal: 'Evaluate the corrective maintenance report for Crude Pump P-102A. Review seal failure root causes (nitrogen precharge decay), verify ISO 1940 dynamic balancing (0.76 g-mm), and confirm ISO 10816-3 Zone A vibration baseline compliance.',
    recommendedRole: 'engineer',
    targetDocId: 'doc-mr-p102a',
    category: 'Machinery Overhaul & Reliability'
  },
  {
    id: 'task-incident-memo',
    title: 'Review Flaring Excursion Memorandum & Flag Sensitive Legal Figures',
    goal: 'Perform compliance review of the August 24 flaring excursion memorandum. Review detected sensitive personal names, employee IDs, and financial reserves ($1,200,000 settlement fund, $250,000 penalty) and record user consent decisions for each item.',
    recommendedRole: 'reviewer',
    targetDocId: 'doc-corr-flare',
    category: 'Compliance & Sensitive Data Review'
  },
  {
    id: 'task-sop-startup',
    title: 'Verify Atmospheric Column Hot Reflux Startup Parameters against SOP 240',
    goal: 'Examine Standard Operating Procedure SOP-OPS-240 for Atmospheric Column T-101. Verify pre-startup hold points, nitrogen blanket pressures (5.2 barg), and emergency temperature criteria for shift operators.',
    recommendedRole: 'engineer',
    targetDocId: 'doc-sop-240',
    category: 'Standard Operating Procedures'
  }
];
