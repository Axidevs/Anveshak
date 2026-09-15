export type Language = 'en' | 'hi';

export type UserRole =
  | 'advocate'
  | 'judicial_officer'
  | 'law_enforcement'
  | 'forensic'
  | 'citizen';

export interface OnboardingData {
  role: UserRole;
  fullName: string;
  idNumber: string;
  courtJurisdiction: string;
  state: string;
  authenticated: boolean;
}

export interface CaseDocket {
  cnrNumber: string;
  caseTitle: string;
  courtName: string;
  stage: string;
  nextHearing: string;
  coram: string;
  firNumber?: string;
  policeStation?: string;
}
