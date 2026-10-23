export interface ScholarshipStudentResult {
  id: string;
  codeNumber: string;
  studentNameBn: string;
  studentNameEn?: string;
  schoolName: string;
  className: 'দশম' | 'নবম' | 'অষ্টম' | 'সপ্তম' | 'ষষ্ঠ' | 'পঞ্চম' | 'চতুর্থ' | 'তৃতীয়' | 'দ্বিতীয়' | 'প্রথম' | 'কেজি';
  classDisplayBn: string;
  scholarshipType: 'ট্যালেন্টপুল' | 'সাধারণ';
  categoryGrade: string;
  serialNo: number;
  overallRank: number;
  year: string;
  publishDate: string;
  totalExaminees: number;
  totalAwardedInClass: number;
  pdfSourceUrl?: string;
}
