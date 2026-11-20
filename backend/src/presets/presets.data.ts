import { FileSpec, Preset, Slot } from '../types';

// NOTE: Portals change their rules every notification. These are typical values - always compare with the
// current official notification (or use the AI Requirement Detector / a custom preset).
const J = (minKB: number, maxKB: number, width?: number, height?: number, dpi = 100): FileSpec => ({ format: 'jpg', minKB, maxKB, width, height, dpi });
const PDF = (maxKB: number, minKB?: number): FileSpec => ({ format: 'pdf', maxKB, minKB });
const photo = (spec: FileSpec): Slot => ({ key: 'photo', label: 'Passport Photo', kind: 'photo', docCategory: 'PASSPORT_PHOTO', filename: 'photo', spec });
const sign = (spec: FileSpec): Slot => ({ key: 'signature', label: 'Signature', kind: 'signature', docCategory: 'SIGNATURE', filename: 'signature', spec });
const doc = (key: string, label: string, docCategory: string, filename: string, spec: FileSpec): Slot => ({ key, label, kind: 'document', docCategory, filename, spec });
const aadhaar = () => doc('aadhaar', 'Aadhaar Card', 'AADHAAR', 'aadhaar', PDF(300));
const marksheet = () => doc('marksheet', 'Marksheet', 'MARKSHEET', 'marksheet', PDF(500));
const thumb = () => doc('thumb', 'Left Thumb Impression', 'OTHER', 'thumb', J(20, 50, 240, 240));
const decl = () => doc('declaration', 'Hand-written Declaration', 'OTHER', 'declaration', J(50, 100, 800, 400));

const P = (id: string, name: string, full: string, category: string, color: string, slots: Slot[]): Preset => ({ id, name, full, category, color, slots });
const sscP = () => photo(J(20, 50, 100, 120));
const sscS = () => sign(J(10, 20, 140, 60));
const std = () => photo(J(20, 50, 200, 230));
const stdS = () => sign(J(10, 20, 140, 60));
const upscP = () => photo(J(20, 300, 350, 350));
const upscS = () => sign(J(10, 300, 350, 120));
const rrbP = () => photo(J(20, 50, 200, 230));
const rrbS = () => sign(J(10, 20, 190, 100));
const exP = () => photo(J(10, 200, 200, 230, 96));
const exS = () => sign(J(4, 30, 200, 80, 96));

export const PRESETS: Preset[] = [
  P('ssc-cgl', 'SSC CGL', 'Staff Selection Commission - Combined Graduate Level', 'SSC', '#1d4ed8', [sscP(), sscS(), aadhaar(), marksheet()]),
  P('ssc-chsl', 'SSC CHSL', 'Staff Selection Commission - CHSL (10+2)', 'SSC', '#1d4ed8', [sscP(), sscS(), aadhaar()]),
  P('ssc-mts', 'SSC MTS', 'Staff Selection Commission - Multi Tasking Staff', 'SSC', '#1d4ed8', [sscP(), sscS()]),
  P('ssc-gd', 'SSC GD', 'Staff Selection Commission - GD Constable', 'SSC', '#1d4ed8', [sscP(), sscS(), aadhaar()]),
  P('ssc-cpo', 'SSC CPO', 'SSC - Central Police Organisation (SI)', 'SSC', '#1d4ed8', [sscP(), sscS(), aadhaar()]),
  P('upsc-cse', 'UPSC CSE', 'Union Public Service Commission - Civil Services', 'UPSC', '#7c3aed', [upscP(), upscS()]),
  P('upsc-nda', 'UPSC NDA', 'National Defence Academy & Naval Academy', 'UPSC', '#7c3aed', [upscP(), upscS()]),
  P('upsc-cds', 'UPSC CDS', 'Combined Defence Services', 'UPSC', '#7c3aed', [upscP(), upscS()]),
  P('rrb-ntpc', 'RRB NTPC', 'Railway Recruitment Board - NTPC', 'Railway', '#0e7490', [rrbP(), rrbS()]),
  P('rrb-group-d', 'RRB Group D', 'Railway Recruitment Board - Level 1 (Group D)', 'Railway', '#0e7490', [rrbP(), rrbS()]),
  P('rrb-alp', 'RRB ALP', 'Railway Recruitment Board - Assistant Loco Pilot', 'Railway', '#0e7490', [rrbP(), rrbS()]),
  P('sbi-po', 'SBI PO', 'State Bank of India - Probationary Officer', 'Banking', '#047857', [std(), stdS(), thumb(), decl()]),
  P('sbi-clerk', 'SBI Clerk', 'State Bank of India - Junior Associate', 'Banking', '#047857', [std(), stdS(), thumb(), decl()]),
  P('ibps-po', 'IBPS PO', 'IBPS - Probationary Officer / MT', 'Banking', '#047857', [std(), stdS(), thumb(), decl()]),
  P('ibps-clerk', 'IBPS Clerk', 'IBPS - Clerk', 'Banking', '#047857', [std(), stdS(), thumb(), decl()]),
  P('ibps-rrb', 'IBPS RRB', 'IBPS - Regional Rural Banks', 'Banking', '#047857', [std(), stdS(), thumb(), decl()]),
  P('police-generic', 'Police Constable', 'State police constable / SI (typical format)', 'Police', '#334155', [std(), stdS(), aadhaar()]),
  P('up-police', 'UP Police', 'Uttar Pradesh Police Recruitment Board', 'Police', '#334155', [std(), stdS(), aadhaar()]),
  P('bihar-police', 'Bihar Police', 'Bihar Police (CSBC / BPSSC)', 'Police', '#334155', [std(), stdS(), aadhaar()]),
  P('state-psc', 'State PSC', 'State Public Service Commission (typical format)', 'State Exams', '#b45309', [std(), stdS(), aadhaar(), marksheet()]),
  P('dsssb', 'DSSSB', 'Delhi Subordinate Services Selection Board', 'State Exams', '#b45309', [std(), stdS(), aadhaar()]),
  P('cuet-ug', 'CUET UG', 'Common University Entrance Test (UG)', 'Entrance', '#be123c', [exP(), exS()]),
  P('neet-ug', 'NEET UG', 'National Eligibility cum Entrance Test (UG)', 'Entrance', '#be123c', [exP(), exS()]),
  P('jee-main', 'JEE Main', 'Joint Entrance Examination - Main', 'Entrance', '#be123c', [exP(), exS()]),
];

export const findPreset = (id: string) => PRESETS.find((p) => p.id === id);
