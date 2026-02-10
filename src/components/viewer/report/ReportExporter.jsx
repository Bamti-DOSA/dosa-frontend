import React, { useState } from "react";
import { Share, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { savePdfRecord } from "../../../db/pdfDB";
import { getChatsByModel } from "../../../api/aiDB"; // DB 호출 함수 추가

const ReportExporter = ({ captureRef, currentPart, modelId, modelName }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!captureRef.current) return alert("캡쳐 영역이 없습니다.");

    try {
      setIsLoading(true);

      // --- 1. DB에서 최신 대화 2개 가져오기 로직 추가 ---
      const savedChats = await getChatsByModel(modelId);

      // 가장 최근 업데이트된 세션 찾기
      const lastSession =
        savedChats.length > 0
          ? [...savedChats].sort((a, b) => b.lastUpdated - a.lastUpdated)[0]
          : null;

      // 해당 세션에서 마지막 2개 메시지 추출 (질문/답변 쌍)
      const recentMessages = lastSession ? lastSession.messages.slice(-6) : [];

      // 채팅 내역을 HTML로 변환
      const chatHtml =
        recentMessages.length > 0
          ? recentMessages
              .map(
                (msg) => `
            <div class="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 ${msg.role === "user" ? "border-blue-400" : "border-green-400"} break-inside-avoid">
              <div class="text-[11px] font-bold text-gray-400 mb-1">
                ${msg.role === "user" ? "USER QUESTION" : "AI ASSISTANT"}
              </div>
              <div class="text-[13px] text-gray-700 leading-relaxed">
                ${msg.content}
              </div>
            </div>
          `,
              )
              .join("")
          : '<div class="text-gray-400 italic text-sm p-4 bg-gray-50 rounded-lg text-center">기록된 AI 대화 내용이 없습니다.</div>';
      // ----------------------------------------------

      // 2. 캡쳐 (고화질)
      const imgData = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // 제목 및 설명 설정
      const reportTitle = currentPart
        ? currentPart.name
        : `${modelName || "Robot Gripper"} 전체 조립도`;
      const reportDesc = currentPart
        ? currentPart.description
        : `이 문서는 ${modelName || "Robot Gripper"}의 전체 조립 형상에 대한 기술 분석 보고서입니다. 현재 특정 부품이 선택되지 않은 상태로, 전체적인 구조와 결합 상태를 나타냅니다.`;

      // 3. IndexedDB에 PDF 기록 저장
      if (modelId && modelId !== "undefined") {
        try {
          await savePdfRecord(String(modelId), reportTitle, imgData, {
            partName: currentPart?.name || "전체 조립도",
            chatCount: recentMessages.length,
            exportDate: new Date().toISOString(),
            htmlContent: chatHtml,
            description: reportDesc,
          });
        } catch (dbError) {
          console.error("❌ PDF 기록 저장 실패:", dbError);
        }
      }

      // 4. 인쇄용 iframe 생성
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${modelName || "Robot Gripper"} Report</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: 'Pretendard', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body class="text-gray-800 p-0 m-0 leading-normal">
          <div class="flex justify-between items-end border-b-2 border-black pb-4 mb-8">
            <div>
              <h1 class="text-2xl font-extrabold text-gray-900 m-0">기술 분석 보고서</h1>
              <div class="text-sm text-gray-500 mt-1">Project: ${modelName || "Robot Gripper"}</div>
            </div>
            <div class="text-xs text-gray-500">출력일: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold text-blue-600 border-l-4 border-blue-600 pl-3 mb-4">1. 모델링 스냅샷</h2>
            <div class="text-center border border-gray-200 p-4 rounded-lg bg-gray-50">
              <img src="${imgData}" class="max-w-full max-h-[400px] rounded shadow-sm mx-auto" />
            </div>
          </div>

          <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold text-blue-600 border-l-4 border-blue-600 pl-3 mb-4">2. 상세 사양</h2>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div class="text-xl font-extrabold text-gray-900 mb-2">${reportTitle}</div>
              <div class="text-[14px] text-gray-600 text-justify leading-relaxed">${reportDesc}</div>
            </div>
          </div>

          <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold text-blue-600 border-l-4 border-blue-600 pl-3 mb-4">3. 최근 AI 기술 질의응답 </h2>
            <div class="bg-white">${chatHtml}</div>
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
          setIsLoading(false);
        }, 2000);
      };
    } catch (error) {
      console.error("Export Error:", error);
      alert("문서 생성 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-900 transition-colors bg-bg-1 rounded-lg disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Share size={18} />
      )}
      <span>{isLoading ? "생성 중..." : "내보내기"}</span>
    </button>
  );
};

export default ReportExporter;
