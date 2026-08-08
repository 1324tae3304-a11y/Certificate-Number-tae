/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarController,
  PieController,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarController,
  PieController
);

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxnRr-ktJ7o1-2peIhBxYuZpwoMxKomvTEkz3DrKXPiqoavDfVsQPrUzZ2p7ihmiP0O/exec';

interface RequestItem {
  id: string;
  category: string;
  department: string;
  count: number;
  startNum?: number;
  endNum?: number;
  batchNum?: number;
  projectName: string;
  activityDate: string;
  requesterName: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  year: number | string;
}

interface AdminHistoryItem {
  action: 'approve' | 'reject';
  projectName: string;
  category: string;
  count: number;
  timestamp: string;
  adminName: string;
  range: string;
}

function ProgressTracker({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  let activeStep = 1;
  if (status === 'pending') activeStep = 2;
  if (status === 'approved' || status === 'rejected') activeStep = 3;

  return (
    <div className="w-full max-w-2xl mx-auto my-4 sm:my-6 px-3 py-4 sm:py-5 bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 rounded-2xl border border-blue-100 shadow-sm">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center flex items-center justify-center gap-1.5">
        <i className="fa-solid fa-bars-staggered text-blue-500"></i>
        แถบสถานะคำขอ (Progress Tracker)
      </div>
      <div className="flex justify-between items-start relative px-1 sm:px-6">
        {/* Track Line Background */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 z-0 rounded-full"></div>
        {/* Track Line Active */}
        <div
          className={`absolute top-5 left-8 h-1 z-0 rounded-full transition-all duration-500 ${
            status === 'rejected'
              ? 'bg-gradient-to-r from-blue-500 via-orange-400 to-red-500'
              : 'bg-gradient-to-r from-blue-500 via-orange-400 to-emerald-500'
          }`}
          style={{
            width: activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : 'calc(100% - 4rem)',
          }}
        ></div>

        {/* Step 1: ส่งแล้ว */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-[100px] sm:max-w-none">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-md ring-4 ring-white">
            <i className="fa-solid fa-paper-plane"></i>
          </div>
          <span className="text-[12px] sm:text-sm font-bold text-slate-800 mt-2">1. ส่งแล้ว</span>
          <span className="text-[10px] sm:text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md mt-1 shadow-2xs">
            ส่งข้อมูลแล้ว
          </span>
        </div>

        {/* Step 2: แอดมินรับทราบ */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-[100px] sm:max-w-none">
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ring-4 ring-white shadow-md transition-all ${
              activeStep >= 2
                ? activeStep === 2
                  ? 'bg-orange-500 text-white animate-pulse ring-orange-200'
                  : 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            <i className={`fa-solid ${activeStep >= 2 ? 'fa-user-check' : 'fa-hourglass'}`}></i>
          </div>
          <span
            className={`text-[12px] sm:text-sm font-bold mt-2 ${
              activeStep === 2 ? 'text-orange-600' : activeStep > 2 ? 'text-slate-800' : 'text-slate-400'
            }`}
          >
            2. แอดมินรับทราบ
          </span>
          <span
            className={`text-[10px] sm:text-xs font-semibold border px-2 py-0.5 rounded-md mt-1 shadow-2xs ${
              activeStep === 2
                ? 'text-orange-600 bg-orange-50 border-orange-200'
                : activeStep > 2
                ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                : 'text-slate-400 bg-slate-100 border-slate-200'
            }`}
          >
            {activeStep === 2 ? 'รับเรื่อง / รอตรวจสอบ' : activeStep > 2 ? 'ตรวจสอบเสร็จสิ้น' : 'รอดำเนินการ'}
          </span>
        </div>

        {/* Step 3: อนุมัติเรียบร้อย */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-[100px] sm:max-w-none">
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ring-4 ring-white shadow-md transition-all ${
              status === 'approved'
                ? 'bg-emerald-500 text-white ring-emerald-200'
                : status === 'rejected'
                ? 'bg-red-500 text-white ring-red-200'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            <i
              className={`fa-solid ${
                status === 'approved'
                  ? 'fa-circle-check'
                  : status === 'rejected'
                  ? 'fa-circle-xmark'
                  : 'fa-ribbon'
              }`}
            ></i>
          </div>
          <span
            className={`text-[12px] sm:text-sm font-bold mt-2 ${
              status === 'approved'
                ? 'text-emerald-600'
                : status === 'rejected'
                ? 'text-red-600'
                : 'text-slate-400'
            }`}
          >
            3. {status === 'rejected' ? 'ไม่อนุมัติ' : 'อนุมัติเรียบร้อย'}
          </span>
          <span
            className={`text-[10px] sm:text-xs font-semibold border px-2 py-0.5 rounded-md mt-1 shadow-2xs ${
              status === 'approved'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                : status === 'rejected'
                ? 'text-red-600 bg-red-50 border-red-200'
                : 'text-slate-400 bg-slate-100 border-slate-200'
            }`}
          >
            {status === 'approved' ? 'ออกเลขสำเร็จ' : status === 'rejected' ? 'ปฏิเสธคำขอ' : 'รอการอนุมัติ'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentMode, setCurrentMode] = useState<'user' | 'report' | 'admin' | 'csv'>('user');
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean>(false);
  const [targetAuthMode, setTargetAuthMode] = useState<'admin' | 'csv'>('admin');

  // Requests and History state
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [adminHistory, setAdminHistory] = useState<AdminHistoryItem[]>([]);
  const [yearlyGlobalCounter, setYearlyGlobalCounter] = useState<Record<string, { lastNum: number; lastBatch: number }>>({});

  // Pagination
  const [reportCurrentPage, setReportCurrentPage] = useState<number>(1);
  const reportItemsPerPage = 10;
  const [historyCurrentPage, setHistoryCurrentPage] = useState<number>(1);
  const historyItemsPerPage = 10;

  // Search & Filter in Report
  const [searchReport, setSearchReport] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [reportStartDate, setReportStartDate] = useState<string>('');
  const [reportEndDate, setReportEndDate] = useState<string>('');
  const [reportDateType, setReportDateType] = useState<'activityDate' | 'approvedAt'>('activityDate');

  // Form State
  const [category, setCategory] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [certCount, setCertCount] = useState<number>(1);
  const [projectName, setProjectName] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>('');
  const [requesterName, setRequesterName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Result View State
  const [showResultBox, setShowResultBox] = useState<boolean>(false);
  const [lastSubmittedReq, setLastSubmittedReq] = useState<RequestItem | null>(null);

  // Modals state
  const [showAdminAuthModal, setShowAdminAuthModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminPinError, setAdminPinError] = useState<boolean>(false);

  const [customModal, setCustomModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'error';
  }>({ show: false, title: '', message: '', type: 'info' });

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editId, setEditId] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('AC');
  const [editProjectName, setEditProjectName] = useState<string>('');
  const [editActivityDate, setEditActivityDate] = useState<string>('');
  const [editRequesterName, setEditRequesterName] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Delete Confirm Modal State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteTargetReq, setDeleteTargetReq] = useState<RequestItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState<boolean>(false);

  // Delete All Auth Modal State
  const [showDeleteAllAuthModal, setShowDeleteAllAuthModal] = useState<boolean>(false);
  const [deleteAllPin, setDeleteAllPin] = useState<string>('');
  const [showDeleteAllPinText, setShowDeleteAllPinText] = useState<boolean>(false);
  const [deleteAllPinError, setDeleteAllPinError] = useState<boolean>(false);
  const [isVerifyingDeleteAll, setIsVerifyingDeleteAll] = useState<boolean>(false);

  // Delete All Final Modal State
  const [showDeleteAllFinalModal, setShowDeleteAllFinalModal] = useState<boolean>(false);
  const [isExecutingDeleteAll, setIsExecutingDeleteAll] = useState<boolean>(false);

  // CSV Import state
  const [importYear, setImportYear] = useState<string>('2569');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Canvas Refs for Chart.js
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const yearlyChartRef = useRef<HTMLCanvasElement | null>(null);

  const barChartInstanceRef = useRef<ChartJS | null>(null);
  const pieChartInstanceRef = useRef<ChartJS | null>(null);
  const yearlyChartInstanceRef = useRef<ChartJS | null>(null);

  // Generate Mock Data on Mount
  useEffect(() => {
    const categories = ['AC', 'SP', 'TR', 'OT'];
    const tempRequests: RequestItem[] = [];
    const counterMap: Record<string, { lastNum: number; lastBatch: number }> = {};

    categories.forEach((cat) => {
      for (let i = 1; i <= 25; i++) {
        const count = Math.floor(Math.random() * 5) + 1;
        const randomTimeOffset = Math.random() * (3 * 365 * 24 * 60 * 60 * 1000);
        const dateObj = new Date(Date.now() - randomTimeOffset);
        const mockYear = dateObj.getFullYear() + 543;

        if (!counterMap[mockYear]) {
          counterMap[mockYear] = { lastNum: 0, lastBatch: 0 };
        }
        counterMap[mockYear].lastBatch += 1;
        const batchNum = counterMap[mockYear].lastBatch;
        const startNum = counterMap[mockYear].lastNum + 1;
        const endNum = startNum + count - 1;
        counterMap[mockYear].lastNum = endNum;

        tempRequests.push({
          id: `REQ-${cat}-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
          category: cat,
          department: 'กลุ่มบริหารทั่วไป',
          count: count,
          startNum: startNum,
          endNum: endNum,
          batchNum: batchNum,
          projectName: `โครงการทดสอบหมวด ${cat} ลำดับที่ ${i}`,
          activityDate: dateObj.toISOString().split('T')[0],
          requesterName: 'ครูทดสอบ ระบบ',
          status: 'approved',
          createdAt: dateObj.toISOString(),
          approvedAt: new Date(dateObj.getTime() + 3600000).toISOString(),
          year: mockYear,
        });
      }
    });

    const sortedRequests = tempRequests.sort(
      (a, b) => new Date(b.approvedAt || 0).getTime() - new Date(a.approvedAt || 0).getTime()
    );

    const history: AdminHistoryItem[] = sortedRequests.map((req) => ({
      action: 'approve',
      projectName: req.projectName,
      category: req.category,
      count: req.count,
      timestamp: req.approvedAt || new Date().toISOString(),
      adminName: 'แอดมิน',
      range: `ชุดที่ ${req.batchNum} = ${String(req.startNum).padStart(4, '0')}-${req.year}${
        req.count > 1 ? ` ถึง ${String(req.endNum).padStart(4, '0')}-${req.year}` : ''
      }`,
    }));

    setRequests(sortedRequests);
    setAdminHistory(history);
    setYearlyGlobalCounter(counterMap);
  }, []);

  // Format Cert Number
  const formatCertNumber = (num: number, year: number | string) => {
    return `${String(num).padStart(4, '0')}-${year}`;
  };

  // Helper for Modals
  const showModal = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setCustomModal({ show: true, title, message, type });
  };

  const closeModal = () => {
    setCustomModal((prev) => ({ ...prev, show: false }));
  };

  // Mode Switcher
  const switchMode = (mode: 'user' | 'report' | 'admin' | 'csv') => {
    if ((mode === 'admin' || mode === 'csv') && !isAdminAuthed) {
      setTargetAuthMode(mode);
      setShowAdminAuthModal(true);
      setAdminPinError(false);
      return;
    }

    setShowAdminAuthModal(false);
    setCurrentMode(mode);

    if (mode === 'report') {
      setReportCurrentPage(1);
    } else if (mode === 'admin') {
      setHistoryCurrentPage(1);
    }
  };

  const checkAdminPin = () => {
    if (adminPinInput === '112233') {
      setIsAdminAuthed(true);
      setShowAdminAuthModal(false);
      setAdminPinInput('');
      setAdminPinError(false);
      setCurrentMode(targetAuthMode);
    } else {
      setAdminPinError(true);
    }
  };

  // Clear Form Fields
  const clearFormFields = () => {
    setCategory('');
    setDepartment('');
    setCertCount(1);
    setProjectName('');
    setActivityDate('');
    setRequesterName('');
  };

  // Form Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const currentYearTh = new Date().getFullYear() + 543;

    const newReq: RequestItem = {
      id: 'REQ-' + Date.now(),
      category,
      department,
      count: certCount,
      projectName,
      activityDate,
      requesterName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      year: currentYearTh,
    };

    setTimeout(() => {
      setRequests((prev) => [newReq, ...prev]);
      setLastSubmittedReq(newReq);
      setShowResultBox(true);
      setIsSubmitting(false);
      clearFormFields();
    }, 800);
  };

  const resetForm = () => {
    clearFormFields();
    setShowResultBox(false);
    setLastSubmittedReq(null);
  };

  const copyResultCertNumber = (req: RequestItem) => {
    let displayLine1 = `ชุดที่ ${req.batchNum}`;
    let displayLine2 = `เลขที่ออก = ${req.startNum}${req.count > 1 ? `-${req.endNum}` : ''}`;
    let displayLine3 = `พ.ศ. ${req.year}`;
    const textToCopy = `${displayLine1}\n${displayLine2}\n${displayLine3}`;

    navigator.clipboard.writeText(textToCopy);
    showModal('สำเร็จ', 'คัดลอกช่วงหมายเลขเกียรติบัตรแล้ว', 'success');
  };

  // Stepper & Chips
  const adjustCertCount = (amount: number) => {
    setCertCount((prev) => {
      let newVal = prev + amount;
      if (newVal < 1) newVal = 1;
      if (newVal > 1000) newVal = 1000;
      return newVal;
    });
  };

  // Admin Actions
  const approveRequest = async (id: string) => {
    const targetReq = requests.find((r) => r.id === id);
    if (!targetReq) return;

    showModal('กำลังดำเนินการ', 'กำลังขอหมายเลขเกียรติบัตรจากเซิร์ฟเวอร์...', 'info');

    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          year: targetReq.year.toString(),
          category: targetReq.category,
          department: targetReq.department,
          count: targetReq.count,
          projectName: targetReq.projectName,
          activityDate: targetReq.activityDate,
          requesterName: targetReq.requesterName,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        const approvedAt = new Date().toISOString();
        const startNum = result.startNum;
        const endNum = result.endNum;
        const year = result.year;

        const updatedCounters = { ...yearlyGlobalCounter };
        if (!updatedCounters[year]) updatedCounters[year] = { lastNum: 0, lastBatch: 0 };

        const batchNum = result.batchNum || updatedCounters[year].lastBatch + 1;
        if (batchNum > updatedCounters[year].lastBatch) updatedCounters[year].lastBatch = batchNum;
        if (endNum > updatedCounters[year].lastNum) updatedCounters[year].lastNum = endNum;

        setYearlyGlobalCounter(updatedCounters);

        const rangeStr = `ชุดที่ ${batchNum} = ${formatCertNumber(startNum, year)}${
          targetReq.count > 1 ? ` ถึง ${formatCertNumber(endNum, year)}` : ''
        }`;

        let updatedReq: RequestItem | null = null;

        setRequests((prev) =>
          prev.map((r) => {
            if (r.id === id) {
              const u: RequestItem = {
                ...r,
                status: 'approved',
                approvedAt,
                startNum,
                endNum,
                year,
                batchNum,
              };
              updatedReq = u;
              return u;
            }
            return r;
          })
        );

        if (lastSubmittedReq && lastSubmittedReq.id === id && updatedReq) {
          setLastSubmittedReq(updatedReq);
        }

        setAdminHistory((prev) => [
          {
            action: 'approve',
            projectName: targetReq.projectName,
            category: targetReq.category,
            count: targetReq.count,
            timestamp: approvedAt,
            adminName: 'แอดมิน',
            range: rangeStr,
          },
          ...prev,
        ]);

        showModal('อนุมัติสำเร็จ', `ออกเลข: ${rangeStr}`, 'success');
      } else {
        showModal('ข้อผิดพลาดจากเซิร์ฟเวอร์', result.message, 'error');
      }
    } catch (error) {
      console.error('Error connecting to GAS:', error);
      // Fallback local mode
      const approvedAt = new Date().toISOString();
      const updatedCounters = { ...yearlyGlobalCounter };
      const reqYear = targetReq.year;

      if (!updatedCounters[reqYear]) updatedCounters[reqYear] = { lastNum: 0, lastBatch: 0 };
      updatedCounters[reqYear].lastBatch += 1;
      const batchNum = updatedCounters[reqYear].lastBatch;
      const startNum = updatedCounters[reqYear].lastNum + 1;
      const endNum = startNum + targetReq.count - 1;
      updatedCounters[reqYear].lastNum = endNum;

      setYearlyGlobalCounter(updatedCounters);

      const rangeStr = `ชุดที่ ${batchNum} = ${formatCertNumber(startNum, reqYear)}${
        targetReq.count > 1 ? ` ถึง ${formatCertNumber(endNum, reqYear)}` : ''
      }`;

      let updatedReq: RequestItem | null = null;

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            const u: RequestItem = {
              ...r,
              status: 'approved',
              approvedAt,
              startNum,
              endNum,
              batchNum,
            };
            updatedReq = u;
            return u;
          }
          return r;
        })
      );

      if (lastSubmittedReq && lastSubmittedReq.id === id && updatedReq) {
        setLastSubmittedReq(updatedReq);
      }

      setAdminHistory((prev) => [
        {
          action: 'approve',
          projectName: targetReq.projectName,
          category: targetReq.category,
          count: targetReq.count,
          timestamp: approvedAt,
          adminName: 'แอดมิน (Local)',
          range: rangeStr,
        },
        ...prev,
      ]);

      showModal(
        'อนุมัติสำเร็จ (Local Mode)',
        `ออกเลข: ${rangeStr}\n*ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ ทำการจำลองตัวเลขแทน`,
        'success'
      );
    }
  };

  const rejectRequest = (id: string) => {
    const targetReq = requests.find((r) => r.id === id);
    if (!targetReq) return;

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );

    setAdminHistory((prev) => [
      {
        action: 'reject',
        projectName: targetReq.projectName,
        category: targetReq.category,
        count: targetReq.count,
        timestamp: new Date().toISOString(),
        adminName: 'แอดมิน',
        range: '-',
      },
      ...prev,
    ]);

    showModal('ปฏิเสธคำขอ', 'ยกเลิกคำขอเรียบร้อยแล้ว', 'info');
  };

  // Edit Modal Actions
  const openEditModal = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    setEditId(id);
    setEditCategory(req.category);
    setEditProjectName(req.projectName);
    setEditActivityDate(req.activityDate);
    setEditRequesterName(req.requesterName);
    setShowEditModal(true);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    setIsSavingEdit(true);

    setTimeout(() => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === editId
            ? {
                ...r,
                category: editCategory,
                projectName: editProjectName,
                activityDate: editActivityDate,
                requesterName: editRequesterName,
              }
            : r
        )
      );

      setIsSavingEdit(false);
      setShowEditModal(false);
      showModal('แก้ไขสำเร็จ', 'แก้ไขข้อมูลเรียบร้อยแล้ว', 'success');
    }, 600);
  };

  // Single Item Delete Actions
  const confirmDelete = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    setDeleteTargetReq(req);
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (!deleteTargetReq) return;

    setIsDeletingItem(true);

    setTimeout(() => {
      setRequests((prev) => prev.filter((r) => r.id !== deleteTargetReq.id));
      setIsDeletingItem(false);
      setShowDeleteModal(false);
      setDeleteTargetReq(null);
      showModal('ลบสำเร็จ', 'ลบข้อมูลเรียบร้อยแล้ว', 'success');
    }, 600);
  };

  // Delete All Actions
  const verifyDeleteAllPin = () => {
    if (!deleteAllPin) return;

    setIsVerifyingDeleteAll(true);

    setTimeout(() => {
      if (deleteAllPin === '112233') {
        setShowDeleteAllAuthModal(false);
        setShowDeleteAllFinalModal(true);
        setDeleteAllPinError(false);
      } else {
        setDeleteAllPinError(true);
      }
      setIsVerifyingDeleteAll(false);
    }, 500);
  };

  const executeDeleteAll = () => {
    setIsExecutingDeleteAll(true);

    setTimeout(() => {
      setRequests([]);
      setAdminHistory([]);
      setYearlyGlobalCounter({});

      setIsExecutingDeleteAll(false);
      setShowDeleteAllFinalModal(false);
      showModal('ล้างข้อมูลสำเร็จ', 'ลบข้อมูลทั้งหมดเรียบร้อยแล้ว', 'success');
    }, 1000);
  };

  // CSV Import
  const downloadCSVTemplate = () => {
    const headers = ['หมวดหมู่ (AC/SP/TR/OT)', 'ชื่อโครงการ', 'วันที่จัดกิจกรรม (YYYY-MM-DD)', 'ชื่อผู้เสนอขอ', 'จำนวนใบ'];
    const exampleData = [
      ['AC', 'โครงการแข่งขันทักษะวิชาการ', '2024-06-15', 'ครูวิภาดา', '10'],
      ['SP', 'การแข่งขันกีฬาสีภายใน', '2024-08-20', 'ครูสมชาย', '25'],
      ['TR', 'อบรมเชิงปฏิบัติการ AI', '2024-09-05', 'ครูสุดา', '15'],
    ];

    let csvContent = '\uFEFF';
    csvContent += headers.join(',') + '\n';
    exampleData.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_cert_import.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCSVImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      showModal('แจ้งเตือน', 'กรุณาเลือกไฟล์ CSV', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      let successCount = 0;

      const newReqs: RequestItem[] = [];
      const newHistories: AdminHistoryItem[] = [];
      const updatedCounters = { ...yearlyGlobalCounter };

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length >= 5) {
          const cat = parts[0].trim().toUpperCase();
          const name = parts[1].trim();
          const date = parts[2].trim();
          const reqName = parts[3].trim();
          const count = parseInt(parts[4].trim());

          if (['AC', 'SP', 'TR', 'OT'].includes(cat) && !isNaN(count) && count > 0) {
            if (!updatedCounters[importYear]) updatedCounters[importYear] = { lastNum: 0, lastBatch: 0 };
            updatedCounters[importYear].lastBatch += 1;
            const batchNum = updatedCounters[importYear].lastBatch;
            const startNum = updatedCounters[importYear].lastNum + 1;
            const endNum = startNum + count - 1;
            updatedCounters[importYear].lastNum = endNum;

            const nowIso = new Date().toISOString();
            const req: RequestItem = {
              id: 'REQ-CSV-' + Date.now() + '-' + i,
              category: cat,
              department: 'นำเข้าจากไฟล์ CSV',
              count,
              projectName: name,
              activityDate: date,
              requesterName: reqName,
              status: 'approved',
              createdAt: nowIso,
              approvedAt: nowIso,
              year: importYear,
              startNum,
              endNum,
              batchNum,
            };

            newReqs.push(req);
            successCount++;

            const rangeStr = `ชุดที่ ${batchNum} = ${formatCertNumber(startNum, importYear)}${
              count > 1 ? ` ถึง ${formatCertNumber(endNum, importYear)}` : ''
            }`;

            newHistories.push({
              action: 'approve',
              projectName: req.projectName + ' (นำเข้า)',
              category: req.category,
              count: req.count,
              timestamp: nowIso,
              adminName: 'ระบบ (CSV)',
              range: rangeStr,
            });
          }
        }
      }

      setYearlyGlobalCounter(updatedCounters);

      if (successCount > 0) {
        setRequests((prev) => [...newReqs, ...prev].sort((a, b) => new Date(b.approvedAt || 0).getTime() - new Date(a.approvedAt || 0).getTime()));
        setAdminHistory((prev) => [...newHistories, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

        showModal('นำเข้าสำเร็จ', `เพิ่มข้อมูลจำนวน ${successCount} รายการเข้าสู่ระบบเรียบร้อยแล้ว`, 'success');
        setCsvFile(null);
        setTimeout(() => switchMode('report'), 1500);
      } else {
        showModal('เกิดข้อผิดพลาด', 'ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV\nโปรดตรวจสอบรูปแบบคอลัมน์อีกครั้ง', 'error');
      }
    };

    reader.readAsText(csvFile);
  };

  // Chart Rendering Logic
  useEffect(() => {
    if (currentMode !== 'user') return;

    const approvedReqs = requests.filter((r) => r.status === 'approved');

    // 1. Monthly Bar Chart
    const monthlyData = new Array(12).fill(0);
    const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    approvedReqs.forEach((r) => {
      const d = new Date(r.approvedAt || r.createdAt);
      const monthIdx = d.getMonth();
      monthlyData[monthIdx] += r.count;
    });

    if (barChartRef.current) {
      if (barChartInstanceRef.current) {
        barChartInstanceRef.current.destroy();
      }
      barChartInstanceRef.current = new ChartJS(barChartRef.current, {
        type: 'bar',
        data: {
          labels: monthLabels,
          datasets: [
            {
              label: 'จำนวนเกียรติบัตร (ใบ)',
              data: monthlyData,
              backgroundColor: '#60a5fa',
              borderWidth: 0,
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              titleFont: { family: 'Sarabun' },
              bodyFont: { family: 'Sarabun' },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { font: { family: 'Sarabun' }, stepSize: 1 },
            },
            x: {
              ticks: { font: { family: 'Sarabun', size: 10 } },
            },
          },
        },
      });
    }

    // 2. Category Pie Chart
    let acCount = 0,
      spCount = 0,
      trCount = 0,
      otCount = 0;
    approvedReqs.forEach((r) => {
      if (r.category === 'AC') acCount += r.count;
      if (r.category === 'SP') spCount += r.count;
      if (r.category === 'TR') trCount += r.count;
      if (r.category === 'OT') otCount += r.count;
    });

    if (pieChartRef.current) {
      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
      }
      pieChartInstanceRef.current = new ChartJS(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: ['วิชาการ (AC)', 'กีฬาฯ (SP)', 'อบรม (TR)', 'อื่นๆ (OT)'],
          datasets: [
            {
              data: [acCount, spCount, trCount, otCount],
              backgroundColor: ['#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'],
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverOffset: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: 'Sarabun', size: 11 },
                usePointStyle: true,
                padding: 15,
              },
            },
            tooltip: {
              titleFont: { family: 'Sarabun' },
              bodyFont: { family: 'Sarabun' },
              callbacks: {
                label: function (context) {
                  let label = context.label || '';
                  if (label) label += ': ';
                  if (context.parsed !== null) label += context.parsed + ' ใบ';
                  return label;
                },
              },
            },
          },
        },
      });
    }

    // 3. Yearly Bar Chart
    const yearlyDataMap: Record<string, number> = {};
    approvedReqs.forEach((r) => {
      const itemYear = r.year ? r.year.toString() : (new Date(r.approvedAt || r.createdAt).getFullYear() + 543).toString();
      if (!yearlyDataMap[itemYear]) yearlyDataMap[itemYear] = 0;
      yearlyDataMap[itemYear] += r.count;
    });

    const sortedYears = Object.keys(yearlyDataMap).sort();
    const yearlyLabels = sortedYears.map((y) => `ปี ${y}`);
    const yearlyData = sortedYears.map((y) => yearlyDataMap[y]);

    const bgColorsYearly = [
      'rgba(16, 185, 129, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(244, 63, 94, 0.8)',
      'rgba(245, 158, 11, 0.8)',
    ];

    if (yearlyChartRef.current) {
      if (yearlyChartInstanceRef.current) {
        yearlyChartInstanceRef.current.destroy();
      }
      yearlyChartInstanceRef.current = new ChartJS(yearlyChartRef.current, {
        type: 'bar',
        data: {
          labels: yearlyLabels,
          datasets: [
            {
              label: 'จำนวนเกียรติบัตร (ใบ)',
              data: yearlyData,
              backgroundColor: bgColorsYearly,
              borderRadius: 6,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              titleFont: { family: 'Sarabun' },
              bodyFont: { family: 'Sarabun' },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { font: { family: 'Sarabun' }, stepSize: 10 },
            },
            x: {
              ticks: {
                font: { family: 'Sarabun', size: 12, weight: 'bold' },
              },
            },
          },
        },
      });
    }

    return () => {
      if (barChartInstanceRef.current) barChartInstanceRef.current.destroy();
      if (pieChartInstanceRef.current) pieChartInstanceRef.current.destroy();
      if (yearlyChartInstanceRef.current) yearlyChartInstanceRef.current.destroy();
    };
  }, [currentMode, requests]);

  // Derived Values
  const currentSubmittedReq = requests.find((r) => r.id === lastSubmittedReq?.id) || lastSubmittedReq;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedReqs = requests.filter((r) => r.status === 'approved');
  const totalApprovedCerts = approvedReqs.reduce((acc, r) => acc + r.count, 0);

  // Pending Category Stats for Admin Workload Summary
  const pendingReqs = requests.filter((r) => r.status === 'pending');
  const pendingAcReqs = pendingReqs.filter((r) => r.category === 'AC');
  const pendingSpReqs = pendingReqs.filter((r) => r.category === 'SP');
  const pendingTrReqs = pendingReqs.filter((r) => r.category === 'TR');
  const pendingOtReqs = pendingReqs.filter((r) => r.category === 'OT');

  const pendingAcCerts = pendingAcReqs.reduce((acc, r) => acc + r.count, 0);
  const pendingSpCerts = pendingSpReqs.reduce((acc, r) => acc + r.count, 0);
  const pendingTrCerts = pendingTrReqs.reduce((acc, r) => acc + r.count, 0);
  const pendingOtCerts = pendingOtReqs.reduce((acc, r) => acc + r.count, 0);

  // Category Stats for Report
  let reportAcCount = 0,
    reportSpCount = 0,
    reportTrCount = 0,
    reportOtCount = 0;
  approvedReqs.forEach((r) => {
    if (r.category === 'AC') reportAcCount += r.count;
    if (r.category === 'SP') reportSpCount += r.count;
    if (r.category === 'TR') reportTrCount += r.count;
    if (r.category === 'OT') reportOtCount += r.count;
  });

  // Filtered Approved Requests for Report
  const searchLower = searchReport.toLowerCase();
  const filteredReportReqs = approvedReqs.filter((r) => {
    if (filterCategory !== 'ALL' && r.category !== filterCategory) return false;

    // Date Range Filter
    if (reportStartDate || reportEndDate) {
      let targetDateStr = '';
      if (reportDateType === 'activityDate') {
        targetDateStr = r.activityDate || '';
      } else {
        const iso = r.approvedAt || r.createdAt || '';
        targetDateStr = iso.split('T')[0];
      }

      if (targetDateStr) {
        if (reportStartDate && targetDateStr < reportStartDate) return false;
        if (reportEndDate && targetDateStr > reportEndDate) return false;
      }
    }

    if (searchLower) {
      const matchProject = r.projectName.toLowerCase().includes(searchLower);
      const matchRequester = r.requesterName.toLowerCase().includes(searchLower);
      const matchStart = r.startNum && r.startNum.toString().includes(searchLower);
      const matchEnd = r.endNum && r.endNum.toString().includes(searchLower);
      return matchProject || matchRequester || matchStart || matchEnd;
    }
    return true;
  });

  const reportTotalPages = Math.ceil(filteredReportReqs.length / reportItemsPerPage) || 1;
  const reportStartIndex = (reportCurrentPage - 1) * reportItemsPerPage;
  const pageReportData = filteredReportReqs.slice(reportStartIndex, reportStartIndex + reportItemsPerPage);

  // History Pagination
  const historyTotalPages = Math.ceil(adminHistory.length / historyItemsPerPage) || 1;
  const historyStartIndex = (historyCurrentPage - 1) * historyItemsPerPage;
  const pageHistoryData = adminHistory.slice(historyStartIndex, historyStartIndex + historyItemsPerPage);

  // Category Styles Mapping
  const catStyles: Record<
    string,
    {
      badge: string;
      rangeBg: string;
      borderLeft: string;
      iconColor: string;
      avatarBg: string;
      label: string;
    }
  > = {
    AC: {
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      rangeBg: 'bg-blue-50 text-blue-900 border-blue-200 shadow-sm',
      borderLeft: 'border-l-4 border-l-blue-500',
      iconColor: 'text-blue-500',
      avatarBg: 'bg-blue-100 text-blue-600',
      label: 'วิชาการ (AC)',
    },
    SP: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rangeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-sm',
      borderLeft: 'border-l-4 border-l-emerald-500',
      iconColor: 'text-emerald-500',
      avatarBg: 'bg-emerald-100 text-emerald-600',
      label: 'กีฬาฯ (SP)',
    },
    TR: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      rangeBg: 'bg-amber-50 text-amber-900 border-amber-200 shadow-sm',
      borderLeft: 'border-l-4 border-l-amber-500',
      iconColor: 'text-amber-500',
      avatarBg: 'bg-amber-100 text-amber-600',
      label: 'อบรม (TR)',
    },
    OT: {
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      rangeBg: 'bg-purple-50 text-purple-900 border-purple-200 shadow-sm',
      borderLeft: 'border-l-4 border-l-purple-500',
      iconColor: 'text-purple-500',
      avatarBg: 'bg-purple-100 text-purple-600',
      label: 'อื่นๆ (OT)',
    },
  };

  return (
    <div className="flex flex-col min-h-screen text-slate-700 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 sm:p-2.5 rounded-xl shadow-lg shadow-pink-500/30">
                <i className="fa-solid fa-graduation-cap text-xl sm:text-2xl text-white"></i>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-800 drop-shadow-sm">
                  ระบบขอเลขเกียรติบัตร
                </h1>
                <p className="text-[12px] sm:text-[14px] font-semibold text-slate-500">
                  โรงเรียนราชประชานุเคราะห์ 51
                </p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-2 bg-[#f4f6f9] p-1.5 rounded-2xl border border-slate-100">
              <button
                onClick={() => switchMode('user')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  currentMode === 'user' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <i className="fa-solid fa-file-signature"></i> ขอเลข
              </button>
              <button
                onClick={() => switchMode('report')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  currentMode === 'report' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <i className="fa-solid fa-list-ol"></i> ทะเบียนคุม
              </button>
              <button
                onClick={() => switchMode('csv')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                  currentMode === 'csv' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <i className="fa-solid fa-file-csv"></i> นำเข้าข้อมูล
              </button>
              <button
                onClick={() => switchMode('admin')}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 relative ${
                  currentMode === 'admin' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <i className="fa-solid fa-shield-halved"></i> จัดการข้อมูล
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {pendingCount}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white flex justify-around p-2 text-slate-500 z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom)+0.5rem)] border-t border-slate-100 rounded-t-2xl">
        <button
          onClick={() => switchMode('user')}
          className={`flex flex-col items-center gap-1 text-[11px] py-2 px-2 rounded-xl font-medium flex-1 transition-colors ${
            currentMode === 'user' ? 'text-pink-600' : 'text-slate-500'
          }`}
        >
          <i className="fa-solid fa-file-signature text-xl mb-0.5"></i> ขอเลข
        </button>
        <button
          onClick={() => switchMode('report')}
          className={`flex flex-col items-center gap-1 text-[11px] py-2 px-2 rounded-xl font-medium flex-1 transition-colors ${
            currentMode === 'report' ? 'text-pink-600' : 'text-slate-500'
          }`}
        >
          <i className="fa-solid fa-list-ol text-xl mb-0.5"></i> ทะเบียนคุม
        </button>
        <button
          onClick={() => switchMode('csv')}
          className={`flex flex-col items-center gap-1 text-[11px] py-2 px-2 rounded-xl font-medium flex-1 transition-colors ${
            currentMode === 'csv' ? 'text-pink-600' : 'text-slate-500'
          }`}
        >
          <i className="fa-solid fa-file-csv text-xl mb-0.5"></i> นำเข้า
        </button>
        <button
          onClick={() => switchMode('admin')}
          className={`flex flex-col items-center gap-1 text-[11px] py-2 px-2 rounded-xl font-medium relative flex-1 transition-colors ${
            currentMode === 'admin' ? 'text-pink-600' : 'text-slate-500'
          }`}
        >
          <i className="fa-solid fa-shield-halved text-xl mb-0.5"></i> แอดมิน
          {pendingCount > 0 && (
            <span className="absolute top-1 right-8 sm:right-12 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ==================== Section 1: User Form ==================== */}
        {currentMode === 'user' && (
          <section className="space-y-6 sm:space-y-8 fade-in">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center text-lg shadow-inner">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 drop-shadow-sm">
                      แบบฟอร์มขอเลขที่เกียรติบัตร
                    </h2>
                    <p className="text-slate-500 text-[13px] sm:text-sm font-medium">
                      กรอกข้อมูลให้ครบถ้วนเพื่อส่งคำขอสร้างหมายเลข
                    </p>
                  </div>
                </div>
                {(category || department || projectName || activityDate || requesterName || certCount > 1) && !showResultBox && (
                  <button
                    type="button"
                    onClick={clearFormFields}
                    className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-2xs cursor-pointer active:scale-95"
                    title="ล้างข้อมูลในฟอร์มทั้งหมด"
                  >
                    <i className="fa-solid fa-rotate-left text-rose-500"></i> ล้างฟอร์ม
                  </button>
                )}
              </div>

              <div className="card-ui p-5 sm:p-8 transition-all duration-300">
                {!showResultBox ? (
                  <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
                          <i className="fa-solid fa-tags text-blue-500 mr-1.5"></i>หมวดหมู่กิจกรรม
                        </label>
                        <select
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-3.5 focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all font-medium text-[16px] sm:text-sm text-slate-700"
                        >
                          <option value="" disabled>
                            เลือกหมวดหมู่กิจกรรม...
                          </option>
                          <option value="AC">วิชาการ (AC)</option>
                          <option value="SP">กีฬาและนันทนาการ (SP)</option>
                          <option value="TR">การอบรม / สัมมนา (TR)</option>
                          <option value="OT">กิจกรรมอื่นๆ (OT)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="department" className="block text-sm font-semibold text-slate-700 mb-1.5">
                          <i className="fa-solid fa-sitemap text-indigo-500 mr-1.5"></i>กลุ่มงาน / ฝ่าย
                        </label>
                        <select
                          id="department"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-3.5 focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all font-medium text-[16px] sm:text-sm text-slate-700"
                        >
                          <option value="" disabled>
                            เลือกกลุ่มงาน...
                          </option>
                          <option value="กลุ่มบริหารวิชาการ">กลุ่มบริหารวิชาการ</option>
                          <option value="กลุ่มบริหารทั่วไป">กลุ่มบริหารทั่วไป</option>
                          <option value="กลุ่มบริหารงานบุคคล">กลุ่มบริหารงานบุคคล</option>
                          <option value="กลุ่มบริหารงบประมาณ">กลุ่มบริหารงบประมาณ</option>
                          <option value="กลุ่มสาระการเรียนรู้">กลุ่มสาระการเรียนรู้</option>
                          <option value="ภาษาไทย">ภาษาไทย</option>
                          <option value="คณิตศาสตร์">คณิตศาสตร์</option>
                          <option value="วิทยาศาสตร์และเทคโนโลยี">วิทยาศาสตร์และเทคโนโลยี</option>
                          <option value="สังคมศึกษา ศาสนา และวัฒนธรรม">สังคมศึกษา ศาสนา และวัฒนธรรม</option>
                          <option value="สุขศึกษาและพลศึกษา">สุขศึกษาและพลศึกษา</option>
                          <option value="ศิลปะ">ศิลปะ</option>
                          <option value="การงานอาชีพ">การงานอาชีพ</option>
                          <option value="ภาษาต่างประเทศ">ภาษาต่างประเทศ</option>
                          <option value="แนะแนว">แนะแนว</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-blue-50/70 border border-blue-100 p-4 sm:p-5 rounded-2xl relative shadow-sm">
                      <label className="block text-sm font-bold text-blue-800 mb-3 flex justify-between items-center">
                        <span>
                          <i className="fa-solid fa-layer-group text-blue-500 mr-1.5"></i>ระบุจำนวนใบที่ต้องการ
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-100 drop-shadow-sm">
                          ออกเลขต่อเนื่อง
                        </span>
                      </label>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center w-full max-w-xs mx-auto bg-white border border-blue-200 rounded-xl overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400">
                          <button
                            type="button"
                            onClick={() => adjustCertCount(-1)}
                            className="w-14 h-12 sm:h-14 flex items-center justify-center bg-slate-50 hover:bg-blue-100 text-blue-600 font-bold text-xl transition-colors focus:outline-none border-r border-blue-100"
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="1000"
                            value={certCount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setCertCount(val);
                            }}
                            required
                            className="w-full h-12 sm:h-14 text-center text-blue-900 text-2xl font-bold focus:outline-none focus:ring-0 border-none p-0 m-0 bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => adjustCertCount(1)}
                            className="w-14 h-12 sm:h-14 flex items-center justify-center bg-slate-50 hover:bg-blue-100 text-blue-600 font-bold text-xl transition-colors focus:outline-none border-l border-blue-100"
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <span className="text-xs font-semibold text-blue-400 w-full text-center sm:w-auto sm:text-left mb-1 sm:mb-0 sm:mr-1">
                            เลือกด่วน:
                          </span>
                          {[20, 25, 30, 35, 40, 50, 100].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setCertCount(val)}
                              className="px-3 py-1.5 bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-lg transition-all shadow-sm"
                            >
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="project-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        <i className="fa-solid fa-clipboard-list text-purple-500 mr-1.5"></i>ชื่อโครงการ / กิจกรรม
                      </label>
                      <input
                        type="text"
                        id="project-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        placeholder="ตัวอย่าง: โครงการแข่งขันทักษะวิชาการ"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-3.5 focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all text-[16px] sm:text-sm text-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label htmlFor="activity-date" className="block text-sm font-semibold text-slate-700 mb-1.5">
                          <i className="fa-solid fa-calendar-day text-orange-500 mr-1.5"></i>วันที่จัดกิจกรรม
                        </label>
                        <input
                          type="date"
                          id="activity-date"
                          value={activityDate}
                          onChange={(e) => setActivityDate(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-3.5 focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all text-[16px] sm:text-sm text-slate-700 font-medium"
                        />
                      </div>
                      <div>
                        <label htmlFor="requester-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                          <i className="fa-solid fa-chalkboard-user text-pink-500 mr-1.5"></i>ชื่อคุณครูผู้เสนอขอ
                        </label>
                        <input
                          type="text"
                          id="requester-name"
                          value={requesterName}
                          onChange={(e) => setRequesterName(e.target.value)}
                          required
                          placeholder="ตัวอย่าง: ครูวิภาดา รักเรียน"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 sm:py-3.5 focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all text-[16px] sm:text-sm text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        onClick={clearFormFields}
                        className="w-full sm:w-auto px-5 py-3.5 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base border border-slate-200 min-h-[48px] active:scale-98"
                        title="ล้างข้อมูลในฟอร์มทั้งหมด"
                      >
                        <i className="fa-solid fa-rotate-left text-slate-500"></i> ล้างฟอร์ม
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px] ${
                          isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> กำลังส่งข้อมูล...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-paper-plane"></i> ส่งคำขอเลขเกียรติบัตร
                          </>
                        )}
                      </button>
                    </div>
                    {isSubmitting && (
                      <p className="text-center text-sm font-bold text-indigo-600 mt-2 animate-pulse flex items-center justify-center gap-1.5">
                        <i className="fa-solid fa-user-gear text-indigo-500"></i> กรุณาติดต่อ ครูณุชรี อ่อนน้ำคำ
                      </p>
                    )}
                  </form>
                ) : (
                  <div className="mt-2 bg-white rounded-2xl p-5 sm:p-8 text-center relative overflow-hidden transition-all duration-300 border-2 border-slate-100">
                    {currentSubmittedReq && (
                      <ProgressTracker status={currentSubmittedReq.status} />
                    )}

                    {currentSubmittedReq?.status === 'pending' && (
                      <div className="mt-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-orange-50 text-orange-500 rounded-full mb-3 sm:mb-4 shadow-sm border border-orange-100">
                          <i className="fa-solid fa-hourglass-half text-3xl sm:text-4xl animate-pulse"></i>
                        </div>
                        <h3 className="text-xl sm:text-3xl font-bold text-slate-800 mb-2 drop-shadow-sm">
                          ส่งคำขอสำเร็จ!
                        </h3>
                        <p className="text-slate-500 mb-2 text-[13px] sm:text-md font-medium">
                          ข้อมูลเข้าระบบแล้ว <span className="text-orange-500 font-bold">กรุณารอแอดมินอนุมัติ</span>
                          <br />
                          <span className="text-indigo-600 font-bold text-sm sm:text-base mt-2 inline-block bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-2xs">
                            <i className="fa-solid fa-user-gear mr-1.5 text-indigo-500"></i> กรุณาติดต่อ ครูณุชรี อ่อนน้ำคำ
                          </span>
                        </p>
                      </div>
                    )}

                    {currentSubmittedReq?.status === 'approved' && (
                      <div className="mt-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-50 text-green-500 rounded-full mb-3 sm:mb-4 shadow-sm border border-green-100">
                          <i className="fa-solid fa-check text-4xl sm:text-5xl"></i>
                        </div>
                        <h3 className="text-xl sm:text-3xl font-bold text-slate-800 mb-2 drop-shadow-sm">
                          อนุมัติเรียบร้อย!
                        </h3>
                        <p className="text-[11px] sm:text-xs font-bold text-green-600 uppercase tracking-wide mb-1 drop-shadow-sm">
                          ช่วงรหัสเกียรติบัตรของคุณ
                        </p>
                        <div className="text-xl sm:text-2xl font-bold text-red-600 py-3 sm:py-4 select-all leading-relaxed break-words max-w-full drop-shadow-sm bg-red-50 rounded-lg inline-block px-6">
                          <div>ชุดที่ {currentSubmittedReq.batchNum}</div>
                          <div>
                            เลขที่ออก = {currentSubmittedReq.startNum}
                            {currentSubmittedReq.count > 1 ? `-${currentSubmittedReq.endNum}` : ''}
                          </div>
                          <div className="text-base sm:text-lg font-medium text-slate-700 mt-1">
                            พ.ศ. {currentSubmittedReq.year}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSubmittedReq?.status === 'rejected' && (
                      <div className="mt-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-50 text-red-500 rounded-full mb-3 sm:mb-4 shadow-sm border border-red-100">
                          <i className="fa-solid fa-xmark text-4xl sm:text-5xl"></i>
                        </div>
                        <h3 className="text-xl sm:text-3xl font-bold text-slate-800 mb-2 drop-shadow-sm">
                          ไม่อนุมัติคำขอ
                        </h3>
                        <p className="text-slate-500 mb-2 text-[13px] sm:text-md font-medium">
                          คำขอเลขเกียรติบัตรของคุณถูกยกเลิก/ปฏิเสธโดยผู้ดูแลระบบ
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                      {currentSubmittedReq?.status === 'approved' && (
                        <button
                          onClick={() => copyResultCertNumber(currentSubmittedReq)}
                          className="bg-slate-800 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
                        >
                          <i className="fa-regular fa-copy"></i> คัดลอก
                        </button>
                      )}
                      <button
                        onClick={resetForm}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-slate-200 w-full sm:w-auto"
                      >
                        <i className="fa-solid fa-plus"></i> ขอเรื่องใหม่
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Stats */}
            <div className="pt-6 sm:pt-8 max-w-4xl mx-auto px-1">
              <div className="mb-4 sm:mb-5 flex items-center gap-2">
                <i className="fa-solid fa-chart-pie text-purple-500 text-xl"></i>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">ภาพรวมระบบ (Dashboard)</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden shadow-md">
                  <p className="text-[11px] sm:text-xs font-semibold text-pink-100 mb-1">ยื่นขอทั้งหมด</p>
                  <p className="text-2xl sm:text-3xl font-bold">{requests.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden shadow-md">
                  <p className="text-[11px] sm:text-xs font-semibold text-purple-100 mb-1">อนุมัติแล้ว</p>
                  <p className="text-2xl sm:text-3xl font-bold">{approvedReqs.length}</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden shadow-md">
                  <p className="text-[11px] sm:text-xs font-semibold text-cyan-100 mb-1">รอพิจารณา</p>
                  <p className="text-2xl sm:text-3xl font-bold">{pendingCount}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden shadow-md">
                  <p className="text-[11px] sm:text-xs font-semibold text-orange-100 mb-1">ไม่อนุมัติ</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {requests.filter((r) => r.status === 'rejected').length}
                  </p>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden shadow-md">
                <p className="text-[11px] sm:text-xs font-semibold text-teal-100 mb-0.5">
                  จำนวนใบเกียรติบัตรที่ออกทั้งหมด
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  รวม <span className="text-2xl sm:text-3xl">{totalApprovedCerts}</span> ใบ
                </p>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6 fade-in items-stretch">
                {/* Bar Chart */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 w-full text-left">
                    <i className="fa-solid fa-chart-column text-blue-500 mr-2"></i>จำนวนใบเกียรติบัตรแยกตามเดือน (กราฟแท่ง)
                  </h3>
                  <div className="w-full h-64 sm:h-72 relative flex-grow">
                    <canvas ref={barChartRef}></canvas>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 w-full text-left">
                    <i className="fa-solid fa-chart-pie text-pink-500 mr-2"></i>สัดส่วนแยกตามหมวดหมู่ (กราฟวงกลม)
                  </h3>
                  <div className="w-full h-64 sm:h-72 relative flex-grow flex justify-center">
                    <canvas ref={pieChartRef}></canvas>
                  </div>
                </div>
              </div>

              {/* Yearly Chart */}
              <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 fade-in w-full">
                <h3 className="text-sm font-bold text-slate-700 mb-4 w-full text-left">
                  <i className="fa-solid fa-calendar-days text-emerald-500 mr-2"></i>จำนวนเกียรติบัตรแยกตามปี (พ.ศ.)
                </h3>
                <div className="w-full h-64 sm:h-72 relative">
                  <canvas ref={yearlyChartRef}></canvas>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== Section 2: Report View ==================== */}
        {currentMode === 'report' && (
          <section className="space-y-6 fade-in max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/25">
                  <i className="fa-solid fa-list-ol"></i>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 drop-shadow-sm">
                    ทะเบียนคุมเกียรติบัตร
                  </h2>
                  <p className="text-slate-500 text-[13px] sm:text-sm font-medium">
                    แสดงรายการเกียรติบัตรที่ได้รับการอนุมัติ เรียงลำดับล่าสุดก่อน
                  </p>
                </div>
              </div>
            </div>

            {/* Comprehensive Search & Date Range Filter Panel */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Search Text */}
                <div className="md:col-span-5 relative">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    <i className="fa-solid fa-magnifying-glass text-indigo-500 mr-1"></i>ค้นหาข้อความ
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 text-sm"></i>
                    <input
                      type="text"
                      value={searchReport}
                      onChange={(e) => {
                        setSearchReport(e.target.value);
                        setReportCurrentPage(1);
                      }}
                      placeholder="ค้นหา โครงการ, เลขที่, ผู้ขอ..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    <i className="fa-solid fa-layer-group text-purple-500 mr-1"></i>หมวดหมู่
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setReportCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                  >
                    <option value="ALL">✨ ทุกหมวดหมู่</option>
                    <option value="AC">📘 วิชาการ (AC)</option>
                    <option value="SP">⚽ กีฬาฯ (SP)</option>
                    <option value="TR">💡 อบรม (TR)</option>
                    <option value="OT">🎨 อื่นๆ (OT)</option>
                  </select>
                </div>

                {/* Date Type */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    <i className="fa-solid fa-calendar-check text-emerald-500 mr-1"></i>ประเภทวันที่สำหรับกรอง
                  </label>
                  <select
                    value={reportDateType}
                    onChange={(e) => {
                      setReportDateType(e.target.value as 'activityDate' | 'approvedAt');
                      setReportCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                  >
                    <option value="activityDate">📅 วันที่จัดกิจกรรม (Activity Date)</option>
                    <option value="approvedAt">✅ วันที่อนุมัติ/ออกเลข (Approved Date)</option>
                  </select>
                </div>
              </div>

              {/* Date Pickers & Quick Presets */}
              <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Inputs: Start & End Date */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">เริ่ม:</span>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => {
                        setReportStartDate(e.target.value);
                        setReportCurrentPage(1);
                      }}
                      className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                    />
                  </div>

                  <span className="text-slate-400 text-xs font-bold">ถึง</span>

                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">สิ้นสุด:</span>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => {
                        setReportEndDate(e.target.value);
                        setReportCurrentPage(1);
                      }}
                      className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
                    />
                  </div>

                  {(reportStartDate || reportEndDate) && (
                    <button
                      onClick={() => {
                        setReportStartDate('');
                        setReportEndDate('');
                        setReportCurrentPage(1);
                      }}
                      className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-2xs"
                      title="ล้างวันที่กรอง"
                    >
                      <i className="fa-solid fa-xmark"></i> ล้างวันที่
                    </button>
                  )}
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar text-xs font-semibold">
                  <span className="text-slate-400 text-[11px] font-bold mr-1 whitespace-nowrap">ทางด่วน:</span>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      setReportStartDate(today);
                      setReportEndDate(today);
                      setReportCurrentPage(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all whitespace-nowrap"
                  >
                    วันนี้
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const d7 = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
                      setReportStartDate(d7.toISOString().split('T')[0]);
                      setReportEndDate(today.toISOString().split('T')[0]);
                      setReportCurrentPage(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all whitespace-nowrap"
                  >
                    7 วันล่าสุด
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const d30 = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
                      setReportStartDate(d30.toISOString().split('T')[0]);
                      setReportEndDate(today.toISOString().split('T')[0]);
                      setReportCurrentPage(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all whitespace-nowrap"
                  >
                    30 วันล่าสุด
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
                      setReportStartDate(firstDay);
                      setReportEndDate(lastDay);
                      setReportCurrentPage(1);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all whitespace-nowrap"
                  >
                    เดือนนี้
                  </button>
                  {(searchReport || filterCategory !== 'ALL' || reportStartDate || reportEndDate) && (
                    <button
                      onClick={() => {
                        setSearchReport('');
                        setFilterCategory('ALL');
                        setReportStartDate('');
                        setReportEndDate('');
                        setReportCurrentPage(1);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all whitespace-nowrap"
                    >
                      ล้างทั้งหมด
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Active Notice / Badge */}
              {(reportStartDate || reportEndDate || searchReport || filterCategory !== 'ALL') && (
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      <i className="fa-solid fa-filter mr-1"></i>เงื่อนไขการกรอง:
                    </span>
                    {reportStartDate && reportEndDate && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                        📅 {reportDateType === 'activityDate' ? 'จัดกิจกรรม' : 'อนุมัติ'}: <strong className="text-slate-900">{reportStartDate}</strong> ถึง <strong className="text-slate-900">{reportEndDate}</strong>
                      </span>
                    )}
                    {reportStartDate && !reportEndDate && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                        📅 ตั้งแต่วันที่: <strong className="text-slate-900">{reportStartDate}</strong>
                      </span>
                    )}
                    {!reportStartDate && reportEndDate && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                        📅 ถึงวันที่: <strong className="text-slate-900">{reportEndDate}</strong>
                      </span>
                    )}
                    {filterCategory !== 'ALL' && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                        หมวดหมู่: <strong className="text-slate-900">{filterCategory}</strong>
                      </span>
                    )}
                    {searchReport && (
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700">
                        คำค้น: "<strong className="text-slate-900">{searchReport}</strong>"
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-600 whitespace-nowrap">
                    พบ <span className="font-bold text-indigo-600 text-sm">{filteredReportReqs.length}</span> รายการ
                  </div>
                </div>
              )}
            </div>

            {/* Mini Category Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-3.5 sm:p-4 text-white shadow-md flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-blue-100">📘 วิชาการ (AC)</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    <span>{reportAcCount}</span> <span className="text-xs font-normal text-blue-200">ใบ</span>
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg">
                  <i className="fa-solid fa-book-bookmark"></i>
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-3.5 sm:p-4 text-white shadow-md flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-emerald-100">⚽ กีฬาฯ (SP)</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    <span>{reportSpCount}</span> <span className="text-xs font-normal text-emerald-200">ใบ</span>
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg">
                  <i className="fa-solid fa-trophy"></i>
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-3.5 sm:p-4 text-white shadow-md flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-amber-100">💡 อบรม (TR)</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    <span>{reportTrCount}</span> <span className="text-xs font-normal text-amber-200">ใบ</span>
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg">
                  <i className="fa-solid fa-chalkboard-user"></i>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-3.5 sm:p-4 text-white shadow-md flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-purple-100">🎨 อื่นๆ (OT)</p>
                  <p className="text-xl sm:text-2xl font-bold">
                    <span>{reportOtCount}</span> <span className="text-xs font-normal text-purple-200">ใบ</span>
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white text-lg">
                  <i className="fa-solid fa-shapes"></i>
                </div>
              </div>
            </div>

            <div className="card-ui overflow-hidden flex flex-col border-t-4 border-t-indigo-500">
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white text-xs sm:text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold w-1/4">
                        <i className="fa-regular fa-calendar-check text-indigo-300 mr-2"></i>วันที่อนุมัติ / ชื่อโครงการ
                      </th>
                      <th className="p-4 font-semibold w-1/4">
                        <i className="fa-solid fa-hashtag text-pink-300 mr-2"></i>ช่วงเลขเกียรติบัตร (ปี พ.ศ.)
                      </th>
                      <th className="p-4 font-semibold w-1/6 text-center">
                        <i className="fa-solid fa-layer-group text-amber-300 mr-2"></i>หมวดหมู่
                      </th>
                      <th className="p-4 font-semibold w-1/4">
                        <i className="fa-solid fa-user-check text-emerald-300 mr-2"></i>ผู้เสนอขอ
                      </th>
                      {isAdminAuthed && (
                        <th className="p-4 font-semibold w-1/6 text-center">
                          <i className="fa-solid fa-gears text-slate-300 mr-2"></i>จัดการ
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {pageReportData.length === 0 ? (
                      <tr>
                        <td colSpan={isAdminAuthed ? 5 : 4} className="p-8 text-center text-slate-400 font-medium">
                          ไม่พบข้อมูล หรือยังไม่มีเกียรติบัตรที่อนุมัติ
                        </td>
                      </tr>
                    ) : (
                      pageReportData.map((req) => {
                        const date = new Date(req.approvedAt || req.createdAt).toLocaleDateString('th-TH');
                        const style = catStyles[req.category] || catStyles['OT'];
                        const itemYear = req.year || '2569';

                        let rangeText = req.batchNum ? `ชุดที่ ${req.batchNum} = ` : '';
                        if (req.count === 1) {
                          rangeText += formatCertNumber(req.startNum || 1, itemYear);
                        } else {
                          rangeText += `${formatCertNumber(req.startNum || 1, itemYear)} - ${formatCertNumber(
                            req.endNum || 1,
                            itemYear
                          )}`;
                        }

                        return (
                          <tr key={req.id} className={`hover:bg-slate-50/80 transition-all ${style.borderLeft}`}>
                            <td className="p-4">
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
                                <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md" title="วันที่อนุมัติ/ออกเลข">
                                  <i className={`fa-regular fa-calendar-check ${style.iconColor}`}></i> {date}
                                </span>
                                {req.activityDate && (
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md" title="วันที่จัดกิจกรรม">
                                    <i className="fa-regular fa-calendar-days mr-0.5 text-emerald-500"></i> กิจกรรม: {req.activityDate}
                                  </span>
                                )}
                              </div>
                              <div className="font-bold text-slate-800 line-clamp-2">{req.projectName}</div>
                            </td>
                            <td className="p-4">
                              <div
                                className={`font-mono font-bold text-[13px] sm:text-sm px-3 py-1.5 rounded-xl border inline-block ${style.rangeBg}`}
                              >
                                <i className={`fa-solid fa-ribbon mr-1.5 ${style.iconColor}`}></i>
                                {rangeText}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 font-semibold ml-1">
                                รวม <span className="font-bold text-slate-700">{req.count}</span> ใบ
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span
                                className={`border px-2.5 py-1 rounded-full font-bold text-xs inline-block ${style.badge}`}
                              >
                                {style.label}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${style.avatarBg}`}
                                >
                                  <i className="fa-solid fa-user-tie"></i>
                                </div>
                                <span className="font-semibold text-slate-700 text-sm">{req.requesterName}</span>
                              </div>
                            </td>
                            {isAdminAuthed && (
                              <td className="p-4 text-center">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => openEditModal(req.id)}
                                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                  >
                                    <i className="fa-solid fa-pen-to-square"></i> แก้ไข
                                  </button>
                                  <button
                                    onClick={() => confirmDelete(req.id)}
                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                  >
                                    <i className="fa-solid fa-trash-can"></i> ลบ
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100 sm:px-6">
                <div className="text-sm font-medium text-slate-600">
                  แสดงหน้า{' '}
                  <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {reportCurrentPage}
                  </span>{' '}
                  จาก <span className="font-bold text-slate-700">{reportTotalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReportCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={reportCurrentPage <= 1}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all font-semibold text-sm shadow-sm disabled:opacity-50"
                  >
                    <i className="fa-solid fa-chevron-left mr-1"></i> ก่อนหน้า
                  </button>
                  <button
                    onClick={() => setReportCurrentPage((prev) => Math.min(reportTotalPages, prev + 1))}
                    disabled={reportCurrentPage >= reportTotalPages}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all font-semibold text-sm shadow-sm disabled:opacity-50"
                  >
                    ถัดไป <i className="fa-solid fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== Section 3: Admin View ==================== */}
        {currentMode === 'admin' && (
          <section className="space-y-6 sm:space-y-8 fade-in max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100/80 text-pink-600 flex items-center justify-center text-lg shadow-inner">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800 drop-shadow-sm">
                    จัดการข้อมูลคำขอ (สำหรับแอดมิน)
                  </h2>
                  <p className="text-slate-500 text-[13px] sm:text-sm font-medium">อนุมัติและออกเลขเกียรติบัตร</p>
                </div>
              </div>
            </div>

            {/* Admin Workload Category Summary (AC, SP, TR, OT) */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-sm font-bold shadow-inner">
                    <i className="fa-solid fa-layer-group"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                      สรุปภาระงานคำขอรออนุมัติ
                    </h3>
                    <p className="text-slate-400 text-xs font-medium">จำแนกสถิติตามหมวดหมู่โครงการ (AC, SP, TR, OT)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/60 w-fit">
                  <span className="text-xs font-medium text-slate-300">รออนุมัติรวม:</span>
                  <span className="font-extrabold text-orange-400 text-base sm:text-lg">{pendingCount}</span>
                  <span className="text-xs text-slate-400 font-semibold">รายการ</span>
                  <span className="text-xs text-slate-400 font-medium">({pendingReqs.reduce((sum, r) => sum + r.count, 0)} ใบ)</span>
                </div>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* AC Card */}
                <div className="bg-slate-800/60 hover:bg-slate-800/90 border border-blue-500/30 rounded-xl p-3 sm:p-3.5 transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] sm:text-xs font-bold text-blue-300 bg-blue-950/90 border border-blue-500/40 px-2 py-0.5 rounded-md">
                      📘 AC วิชาการ
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${pendingAcReqs.length > 0 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-slate-700/50 text-slate-400'}`}>
                      {pendingAcReqs.length} คำขอ
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">{pendingAcReqs.length}</span>
                      <span className="text-xs text-slate-400 font-medium">คำขอ</span>
                    </div>
                    <span className="text-xs text-slate-300 font-semibold bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
                      {pendingAcCerts} ใบ
                    </span>
                  </div>
                </div>

                {/* SP Card */}
                <div className="bg-slate-800/60 hover:bg-slate-800/90 border border-emerald-500/30 rounded-xl p-3 sm:p-3.5 transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] sm:text-xs font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                      ⚽ SP กีฬาฯ
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${pendingSpReqs.length > 0 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-slate-700/50 text-slate-400'}`}>
                      {pendingSpReqs.length} คำขอ
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{pendingSpReqs.length}</span>
                      <span className="text-xs text-slate-400 font-medium">คำขอ</span>
                    </div>
                    <span className="text-xs text-slate-300 font-semibold bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
                      {pendingSpCerts} ใบ
                    </span>
                  </div>
                </div>

                {/* TR Card */}
                <div className="bg-slate-800/60 hover:bg-slate-800/90 border border-amber-500/30 rounded-xl p-3 sm:p-3.5 transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] sm:text-xs font-bold text-amber-300 bg-amber-950/90 border border-amber-500/40 px-2 py-0.5 rounded-md">
                      💡 TR อบรม
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${pendingTrReqs.length > 0 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-slate-700/50 text-slate-400'}`}>
                      {pendingTrReqs.length} คำขอ
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pendingTrReqs.length}</span>
                      <span className="text-xs text-slate-400 font-medium">คำขอ</span>
                    </div>
                    <span className="text-xs text-slate-300 font-semibold bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
                      {pendingTrCerts} ใบ
                    </span>
                  </div>
                </div>

                {/* OT Card */}
                <div className="bg-slate-800/60 hover:bg-slate-800/90 border border-purple-500/30 rounded-xl p-3 sm:p-3.5 transition-all shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] sm:text-xs font-bold text-purple-300 bg-purple-950/90 border border-purple-500/40 px-2 py-0.5 rounded-md">
                      🎨 OT อื่นๆ
                    </span>
                    <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${pendingOtReqs.length > 0 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-slate-700/50 text-slate-400'}`}>
                      {pendingOtReqs.length} คำขอ
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-purple-400">{pendingOtReqs.length}</span>
                      <span className="text-xs text-slate-400 font-medium">คำขอ</span>
                    </div>
                    <span className="text-xs text-slate-300 font-semibold bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
                      {pendingOtCerts} ใบ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="card-ui overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-bell text-orange-500"></i> คำขอรออนุมัติ
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>
                </h3>
              </div>
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-slate-500 text-xs sm:text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold w-1/4">วันที่ขอ / ผู้ขอ</th>
                      <th className="p-4 font-semibold w-1/3">โครงการ</th>
                      <th className="p-4 font-semibold w-1/6 text-center">หมวดหมู่ / จำนวน</th>
                      <th className="p-4 font-semibold w-1/4 text-center">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {pendingCount === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">
                          ไม่มีคำขอรออนุมัติ
                        </td>
                      </tr>
                    ) : (
                      requests
                        .filter((r) => r.status === 'pending')
                        .map((req) => {
                          const date = new Date(req.createdAt).toLocaleDateString('th-TH');
                          return (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4">
                                <div className="font-bold text-slate-800">{date}</div>
                                <div className="text-xs text-slate-500">{req.requesterName}</div>
                              </td>
                              <td className="p-4 font-medium text-slate-700">{req.projectName}</td>
                              <td className="p-4 text-center">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                  {req.category}
                                </span>
                                <div className="mt-1 text-xs text-slate-500 font-bold">{req.count} ใบ</div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => approveRequest(req.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                  >
                                    <i className="fa-solid fa-check"></i> อนุมัติ
                                  </button>
                                  <button
                                    onClick={() => rejectRequest(req.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                  >
                                    <i className="fa-solid fa-xmark"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admin History */}
            <div className="card-ui overflow-hidden mt-8">
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-slate-500"></i> ประวัติการดำเนินการ (เรียงล่าสุดก่อน)
                </h3>
                <button
                  onClick={() => {
                    setDeleteAllPin('');
                    setDeleteAllPinError(false);
                    setShowDeleteAllAuthModal(true);
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-trash-can"></i> ลบข้อมูลทั้งหมด
                </button>
              </div>
              <div className="overflow-x-auto hide-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {pageHistoryData.length === 0 ? (
                      <tr>
                        <td className="p-8 text-center text-slate-400">ยังไม่มีประวัติการดำเนินการ</td>
                      </tr>
                    ) : (
                      pageHistoryData.map((h, idx) => {
                        const isApprove = h.action === 'approve';
                        const date = new Date(h.timestamp).toLocaleString('th-TH', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        });
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isApprove ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                  }`}
                                >
                                  <i className={`fa-solid ${isApprove ? 'fa-check' : 'fa-xmark'}`}></i>
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">{h.projectName}</div>
                                  <div className="text-[11px] text-slate-500">
                                    {date} โดย {h.adminName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              {isApprove ? (
                                <span className="font-mono font-bold text-sm bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700">
                                  {h.range}
                                </span>
                              ) : (
                                <span className="text-xs text-red-500 font-bold">ไม่อนุมัติ</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* History Pagination */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-t border-slate-100 sm:px-6">
                <div className="text-sm text-slate-600">
                  แสดงหน้า <span className="font-bold text-blue-600">{historyCurrentPage}</span> จาก{' '}
                  <span className="font-bold text-slate-700">{historyTotalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHistoryCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={historyCurrentPage <= 1}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50"
                  >
                    <i className="fa-solid fa-chevron-left mr-1"></i> ก่อนหน้า
                  </button>
                  <button
                    onClick={() => setHistoryCurrentPage((prev) => Math.min(historyTotalPages, prev + 1))}
                    disabled={historyCurrentPage >= historyTotalPages}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50"
                  >
                    ถัดไป <i className="fa-solid fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== Section 4: CSV Import ==================== */}
        {currentMode === 'csv' && (
          <section className="space-y-6 fade-in max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center text-lg shadow-inner">
                <i className="fa-solid fa-file-excel"></i>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 drop-shadow-sm">
                  นำเข้าข้อมูลจากไฟล์ CSV
                </h2>
                <p className="text-slate-500 text-[13px] sm:text-sm font-medium">
                  เพิ่มประวัติข้อมูลเกียรติบัตรย้อนหลัง หรือแบบกลุ่ม (Batch)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Download Template */}
              <div className="card-ui p-6 flex flex-col justify-between border-t-4 border-t-emerald-500">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2">
                    <i className="fa-solid fa-download text-emerald-500 mr-2"></i> 1. ดาวน์โหลดแม่แบบ
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    กรุณาดาวน์โหลดไฟล์แม่แบบ CSV และกรอกข้อมูลตามคอลัมน์ที่กำหนด ห้ามเปลี่ยนชื่อคอลัมน์บรรทัดแรก
                  </p>
                  <ul className="text-[13px] text-slate-500 space-y-1.5 mb-6 ml-2">
                    <li>
                      <i className="fa-solid fa-circle-check text-emerald-400 mr-2"></i>
                      <b>หมวดหมู่:</b> ให้ระบุเป็น AC, SP, TR, หรือ OT เท่านั้น
                    </li>
                    <li>
                      <i className="fa-solid fa-circle-check text-emerald-400 mr-2"></i>
                      <b>วันที่:</b> รูปแบบ YYYY-MM-DD (เช่น 2024-05-20)
                    </li>
                    <li>
                      <i className="fa-solid fa-circle-check text-emerald-400 mr-2"></i>
                      <b>จำนวนใบ:</b> ระบุเป็นตัวเลขเท่านั้น (เช่น 15)
                    </li>
                  </ul>
                </div>
                <button
                  onClick={downloadCSVTemplate}
                  className="w-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 hover:border-emerald-200 border border-slate-200 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <i className="fa-solid fa-file-arrow-down"></i> โหลดแม่แบบ CSV
                </button>
              </div>

              {/* Card 2: Upload CSV */}
              <div className="card-ui p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2">
                    <i className="fa-solid fa-upload text-blue-500 mr-2"></i> 2. อัปโหลดข้อมูลเข้าสู่ระบบ
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    เลือกไฟล์ CSV ที่กรอกข้อมูลเรียบร้อยแล้ว พร้อมระบุปี พ.ศ. ของข้อมูลชุดนี้
                  </p>

                  <form onSubmit={handleCSVImport} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        ปี พ.ศ. ของข้อมูลนำเข้า
                      </label>
                      <input
                        type="number"
                        required
                        value={importYear}
                        min="2500"
                        max="2600"
                        onChange={(e) => setImportYear(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:bg-white outline-none transition-all text-sm text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">เลือกไฟล์ CSV</label>
                      <input
                        type="file"
                        accept=".csv"
                        required
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all border border-slate-200 rounded-xl bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 mt-4 rounded-xl shadow-lg shadow-blue-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-cloud-arrow-up"></i> เริ่มนำเข้าข้อมูล
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-5 sm:py-6 text-center z-10 relative">
        <p className="text-[13px] sm:text-sm font-semibold text-slate-400">
          <i className="fa-solid fa-code text-pink-400 mr-1.5"></i> ผู้พัฒนาระบบ: ครูวิทวัส นาคดี
        </p>
      </footer>

      {/* Custom Modal */}
      {customModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl fade-in text-center max-h-[92vh] overflow-y-auto">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl sm:text-3xl ${
                customModal.type === 'success'
                  ? 'bg-green-100 text-green-500'
                  : customModal.type === 'error'
                  ? 'bg-red-100 text-red-500'
                  : 'bg-blue-100 text-blue-500'
              }`}
            >
              <i
                className={`fa-solid ${
                  customModal.type === 'success'
                    ? 'fa-check'
                    : customModal.type === 'error'
                    ? 'fa-xmark'
                    : 'fa-info-circle'
                }`}
              ></i>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">{customModal.title}</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 whitespace-pre-line">{customModal.message}</p>
            <button
              onClick={closeModal}
              className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-all text-sm min-h-[44px]"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Admin Auth Modal */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-8 max-w-sm w-full shadow-2xl relative fade-in text-center max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAdminAuthModal(false);
                setCurrentMode('user');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-lock text-xl sm:text-2xl"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
              {targetAuthMode === 'admin' ? 'ตรวจสอบสิทธิ์เข้าถึง' : 'ตรวจสอบสิทธิ์นำเข้าข้อมูล'}
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6">
              {targetAuthMode === 'admin'
                ? 'กรุณากรอกรหัสผ่านเพื่อเข้าสู่หน้าจัดการข้อมูล'
                : 'กรุณากรอกรหัสผ่านเพื่อเข้าสู่หน้านำเข้าข้อมูล CSV'}
            </p>

            <input
              type="password"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkAdminPin()}
              placeholder="••••••"
              className="w-full text-center text-xl sm:text-2xl tracking-widest bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-400 focus:bg-white outline-none mb-4 font-mono min-h-[48px]"
            />

            <button
              onClick={checkAdminPin}
              className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md hover:bg-slate-700 transition-all text-sm sm:text-base min-h-[48px]"
            >
              ยืนยันรหัสผ่าน
            </button>
            {adminPinError && (
              <p className="text-red-500 text-xs sm:text-sm mt-3 font-semibold">
                <i className="fa-solid fa-circle-exclamation"></i> รหัสผ่านไม่ถูกต้อง
              </p>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-8 max-w-lg w-full shadow-2xl relative fade-in my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-lg">
                <i className="fa-solid fa-pen-to-square"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">แก้ไขข้อมูลรายการ</h3>
            </div>

            <form onSubmit={saveEdit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่กิจกรรม</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] sm:text-sm focus:ring-2 focus:ring-amber-400 outline-none min-h-[44px]"
                >
                  <option value="AC">วิชาการ (AC)</option>
                  <option value="SP">กีฬาและนันทนาการ (SP)</option>
                  <option value="TR">การอบรม / สัมมนา (TR)</option>
                  <option value="OT">กิจกรรมอื่นๆ (OT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อโครงการ / กิจกรรม</label>
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] sm:text-sm focus:ring-2 focus:ring-amber-400 outline-none min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่จัดกิจกรรม</label>
                  <input
                    type="date"
                    value={editActivityDate}
                    onChange={(e) => setEditActivityDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] sm:text-sm focus:ring-2 focus:ring-amber-400 outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้เสนอขอ</label>
                  <input
                    type="text"
                    value={editRequesterName}
                    onChange={(e) => setEditRequesterName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] sm:text-sm focus:ring-2 focus:ring-amber-400 outline-none min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-sm min-h-[44px]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isSavingEdit ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk"></i> บันทึกการแก้ไข
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && deleteTargetReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-8 max-w-sm w-full shadow-2xl relative fade-in text-center max-h-[92vh] overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-triangle-exclamation text-2xl sm:text-3xl"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">ยืนยันการลบข้อมูล</h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-4">
              คุณต้องการลบข้อมูลรายการนี้ใช่หรือไม่? เมื่อลบแล้วจะไม่สามารถกู้คืนได้
            </p>
            <div className="bg-slate-50 p-3 rounded-xl text-xs font-semibold text-slate-700 mb-6 border border-slate-100 break-words line-clamp-2">
              โครงงาน/กิจกรรม: {deleteTargetReq.projectName}
              <br />
              ผู้เสนอขอ: {deleteTargetReq.requesterName}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTargetReq(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition-all text-sm min-h-[44px]"
              >
                ยกเลิก
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeletingItem}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isDeletingItem ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> กำลังลบ...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash-can"></i> ยืนยันการลบ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Auth Modal */}
      {showDeleteAllAuthModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-8 max-w-sm w-full shadow-2xl relative fade-in text-center border-t-4 border-red-500 max-h-[92vh] overflow-y-auto">
            <button onClick={() => setShowDeleteAllAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-skull-crossbones text-xl sm:text-2xl"></i>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-2">ลบข้อมูลทั้งหมด</h3>
            <p className="text-slate-500 text-xs mb-6 font-medium bg-red-50 p-3 rounded-xl border border-red-100 text-red-800">
              คำเตือน! การดำเนินการนี้จะลบข้อมูลทั้งหมดออกจากระบบ และไม่สามารถกู้คืนได้ กรุณากรอกรหัสผ่านเพื่อยืนยัน
            </p>

            <div className="relative mb-4">
              <input
                type={showDeleteAllPinText ? 'text' : 'password'}
                value={deleteAllPin}
                onChange={(e) => setDeleteAllPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyDeleteAllPin()}
                placeholder="••••••"
                className="w-full text-center text-xl tracking-widest bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-400 focus:bg-white outline-none font-mono min-h-[48px]"
              />
              <button
                type="button"
                onClick={() => setShowDeleteAllPinText(!showDeleteAllPinText)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
              >
                <i className={`fa-solid ${showDeleteAllPinText ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>

            <button
              onClick={verifyDeleteAllPin}
              disabled={isVerifyingDeleteAll}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-red-700 transition-all text-sm sm:text-base min-h-[48px]"
            >
              {isVerifyingDeleteAll ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> กำลังตรวจสอบ...
                </>
              ) : (
                'ยืนยันรหัสผ่าน'
              )}
            </button>
            {deleteAllPinError && (
              <p className="text-red-500 text-xs sm:text-sm mt-3 font-semibold">
                <i className="fa-solid fa-circle-exclamation"></i> รหัสยืนยันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete All Final Modal */}
      {showDeleteAllFinalModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-red-600 rounded-2xl p-5 sm:p-8 max-w-sm w-full shadow-2xl relative fade-in text-center text-white border border-red-500 max-h-[92vh] overflow-y-auto">
            <i className="fa-solid fa-triangle-exclamation text-5xl sm:text-6xl mb-4 text-white drop-shadow-md animate-pulse"></i>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">ยืนยันรอบสุดท้าย</h3>
            <p className="text-red-100 text-xs sm:text-sm mb-6 sm:mb-8 font-medium">
              คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllFinalModal(false)}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl transition-all text-sm backdrop-blur-sm min-h-[44px]"
              >
                ยกเลิก
              </button>
              <button
                onClick={executeDeleteAll}
                disabled={isExecutingDeleteAll}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 border border-slate-800 min-h-[44px]"
              >
                {isExecutingDeleteAll ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> กำลังลบ...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-bomb"></i> ลบข้อมูลถาวร
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
