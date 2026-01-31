import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReportStatus, ReportCategory } from '@/data/burkinaFaso';

export interface Report {
  id: string;
  userId: string;
  category: ReportCategory;
  subcategory: string;
  city: string;
  neighborhood: string;
  description: string;
  photo: string;
  latitude?: number;
  longitude?: number;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface ReportsContextType {
  reports: Report[];
  userReports: Report[];
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;
  getReportById: (id: string) => Report | undefined;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

interface ReportsProviderProps {
  children: ReactNode;
  userId?: string;
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children, userId }) => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const savedReports = localStorage.getItem('faso_propre_reports');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  const userReports = reports.filter(r => r.userId === userId);

  const addReport = (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newReport: Report = {
      ...reportData,
      id: crypto.randomUUID(),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    localStorage.setItem('faso_propre_reports', JSON.stringify(updatedReports));
  };

  const updateReportStatus = (reportId: string, status: ReportStatus) => {
    const updatedReports = reports.map(r => 
      r.id === reportId 
        ? { ...r, status, updatedAt: new Date() }
        : r
    );
    setReports(updatedReports);
    localStorage.setItem('faso_propre_reports', JSON.stringify(updatedReports));
  };

  const getReportById = (id: string) => reports.find(r => r.id === id);

  return (
    <ReportsContext.Provider value={{
      reports,
      userReports,
      addReport,
      updateReportStatus,
      getReportById,
    }}>
      {children}
    </ReportsContext.Provider>
  );
};
