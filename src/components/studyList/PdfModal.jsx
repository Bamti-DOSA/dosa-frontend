import React, { useEffect, useState } from "react";
import { getAllPdfs, deletePdfRecord } from "../../db/pdfDB";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FileText,
  Download,
  Trash2,
  X,
} from "lucide-react";

// 모델 ID와 이름 매핑
const MODEL_NAMES = {
  1: "Drone",
  2: "Leaf Spring",
  3: "Machine Vice",
  4: "Robot Arm",
  5: "Robot Gripper",
  6: "Suspension",
  7: "V4 Engine",
};

const PdfModal = ({ isOpen, onClose, allModels }) => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      loadPdfs();
    }
  }, [isOpen]);

  const loadPdfs = async () => {
    try {
      setLoading(true);
      const allPdfs = await getAllPdfs();
      setPdfs(allPdfs);

      // 기본값: 모든 폴더 접힌 상태
      setExpandedFolders(new Set());
    } catch (error) {
      console.error("❌ PDF 기록 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const getModelInfo = (modelId) => {
    const model = allModels.find((m) => m.objectId === modelId);
    return {
      name: MODEL_NAMES[modelId] || model?.name || "알 수 없음",
      type: model?.type || "기타",
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = (pdf) => {
    try {
      // iframe을 사용하여 PDF 재생성 및 인쇄
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      const modelInfo = getModelInfo(pdf.modelId);

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${pdf.title} Report</title>
          <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Pretendard', 'sans-serif'],
                  },
                }
              }
            }
          </script>
          <style>
            @page { size: A4; margin: 20mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body class="font-sans text-gray-800 antialiased p-0 m-0 leading-normal">
          <div class="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
            <div>
              <h1 class="text-2xl font-extrabold text-gray-900 m-0">기술 분석 보고서</h1>
              <div class="text-sm text-gray-500 mt-1">Project: ${modelInfo.name} System</div>
            </div>
            <div class="text-xs text-gray-500">출력일: ${formatDate(pdf.createdAt)}</div>
          </div>

          <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold text-blue-600 border-l-4 border-blue-600 pl-3 mb-4">
              1. 모델링 스냅샷
            </h2>
            <div class="text-center border border-gray-200 p-6 rounded-lg bg-gray-50">
              <img src="${pdf.pdfData}" class="max-w-full max-h-[400px] rounded shadow-sm mx-auto" />
            </div>
          </div>

          <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold text-blue-600 border-l-4 border-blue-600 pl-3 mb-4">
              2. 상세 사양 및 기술 이론
            </h2>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div class="text-xl font-extrabold text-gray-900 mb-2">${pdf.title}</div>
              <div class="text-[15px] text-gray-600 text-justify leading-7">
                ${pdf.metadata?.description || ""}
              </div>
            </div>
          </div>

          <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold text-blue-600 border-l-4 border-blue-600 pl-3 mb-4">
              3. AI 기술 질의응답
            </h2>
            <div class="bg-white">
              ${pdf.metadata?.htmlContent || ""}
            </div>
          </div>
        </body>
        </html>
      `);
      doc.close();

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 500);

        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      };
    } catch (error) {
      console.error("❌ PDF 다운로드 실패:", error);
      alert("PDF를 다운로드하는데 실패했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("이 PDF 기록을 삭제하시겠습니까?")) return;

    try {
      await deletePdfRecord(id);
      loadPdfs();
    } catch (error) {
      console.error("❌ PDF 삭제 실패:", error);
      alert("PDF 기록 삭제에 실패했습니다.");
    }
  };

  const toggleFolder = (modelId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  // 모델별로 PDF 그룹화
  const groupedPdfs = pdfs.reduce((acc, pdf) => {
    if (!acc[pdf.modelId]) {
      acc[pdf.modelId] = [];
    }
    acc[pdf.modelId].push(pdf);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-[900px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="t-20-semi text-gray-900">PDF 출력 기록</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-gray-7" />
          </button>
        </div>

        {/* PDF 리스트 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-pulse">로딩 중...</div>
            </div>
          ) : pdfs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 b-16-reg">
                저장된 PDF 기록이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(groupedPdfs).map(([modelId, modelPdfs]) => {
                const modelInfo = getModelInfo(modelId);
                const isExpanded = expandedFolders.has(modelId);

                return (
                  <div key={modelId} className=" rounded-lg overflow-hidden">
                    {/* 폴더 헤더 */}
                    <div
                      onClick={() => toggleFolder(modelId)}
                      className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-acc-green-light/10 cursor-pointer transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                      <Folder className="w-5 h-5 text-acc-green" />
                      <div className="flex-1">
                        <div className="b-16-semi text-gray-900">
                          {modelInfo.name}
                        </div>
                        <div className="d-12-reg text-gray-500">
                          {modelInfo.type} · {modelPdfs.length}개의 PDF
                        </div>
                      </div>
                    </div>

                    {/* PDF 리스트 */}
                    {isExpanded && (
                      <div className="bg-white divide-y divide-gray-100">
                        {modelPdfs
                          .sort(
                            (a, b) =>
                              new Date(b.createdAt) - new Date(a.createdAt),
                          )
                          .map((pdf) => (
                            <div
                              key={pdf.id}
                              className="p-4 hover:bg-acc-blue-light/5 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 flex items-start gap-3">
                                  <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="b-14-semi text-gray-900 mb-1">
                                      {pdf.title}
                                    </div>
                                    <div className="flex items-center gap-4 d-12-reg text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <svg
                                          className="w-3.5 h-3.5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                        {formatDate(pdf.createdAt)}
                                      </span>
                                      {pdf.metadata?.chatCount && (
                                        <span>
                                          {pdf.metadata.chatCount}개 대화
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 ml-2">
                                  <button
                                    onClick={() => handleDownload(pdf)}
                                    className="p-2 text-acc-blue hover:bg-blue-50 rounded-lg transition-colors"
                                    title="다시 인쇄"
                                  >
                                    <Download size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(pdf.id)}
                                    className="p-2 text-acc-red hover:bg-red-50 rounded-lg transition-colors"
                                    title="삭제"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 통계 */}
        {!loading && pdfs.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
            <div className="flex items-center justify-between d-12-reg text-gray-500">
              <div className="flex gap-4">
                <span>
                  관련 모델{" "}
                  <strong className="text-gray-700">
                    {Object.keys(groupedPdfs).length}
                  </strong>
                  개
                </span>
                <span className="w-[1px] h-3 bg-gray-200 self-center" />
                <span>
                  전체 pdf 기록{" "}
                  <strong className="text-gray-700">{pdfs.length}</strong>개
                </span>
              </div>
              <span className="text-gray-400">
                최근 다운로드: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfModal;
