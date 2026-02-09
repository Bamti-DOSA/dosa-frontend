import React, { useState } from "react";
import { Share, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { savePdfRecord } from "../../../db/pdfDB";

const ReportExporter = ({ captureRef, currentPart, chatHistory, modelId, modelName }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!captureRef.current) return alert("캡쳐 영역이 없습니다.");

    try {
      setIsLoading(true);


      // 1. 캡쳐 (고화질)
      const imgData = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // 제목 및 설명 설정
      const reportTitle = currentPart ? currentPart.name : `${modelName || 'Robot Gripper'} 전체 조립도`;
      const reportDesc = currentPart 
        ? currentPart.description 
        : `이 문서는 ${modelName || 'Robot Gripper'}의 전체 조립 형상에 대한 기술 분석 보고서입니다. 현재 특정 부품이 선택되지 않은 상태로, 전체적인 구조와 결합 상태를 나타냅니다. 각 부품의 유기적인 연결 구조를 확인할 수 있습니다.`;

      // 채팅 기록 HTML 변환
      const chatHtml = chatHistory.map(chat => `
        <div class="mb-6 border-b border-dashed border-gray-200 pb-4 break-inside-avoid">
          <div class="mb-2 text-sm text-gray-600">
            <strong class="text-gray-900">${chat.title}</strong> 
            <span class="text-xs text-gray-400 font-normal ml-1">(${chat.date})</span>
          </div>
          <div class="space-y-1">
            ${chat.messages.length > 0 
              ? chat.messages.map(m => 
                  `<div class="text-[13px] leading-relaxed">
                    <span class="font-bold inline-block w-8 ${m.role === 'user' ? 'text-gray-800' : 'text-blue-600'}">
                      ${m.role === 'user' ? '나' : 'AI'}
                    </span>
                    <span class="text-gray-700">${m.text || m.content}</span>
                   </div>`
                ).join('') 
              : '<span class="text-xs text-gray-400 italic">대화 내용 없음</span>'}
          </div>
        </div>
      `).join('');

      // modelId가 유효한지 확인
      if (!modelId || modelId === 'undefined') {
        console.error('❌ modelId가 유효하지 않습니다:', modelId);
        alert('모델 ID를 찾을 수 없습니다. 페이지를 새로고침 해주세요.');
        setIsLoading(false);
        return;
      }

      // IndexedDB에 PDF 기록 저장
      try {
        const savedId = await savePdfRecord(
          String(modelId), // ✅ modelId를 문자열로 변환하여 저장
          reportTitle,
          imgData,
          {
            partName: currentPart?.name || '전체 조립도',
            chatCount: chatHistory.length,
            exportDate: new Date().toISOString(),
            htmlContent: chatHtml,
            description: reportDesc,
          }
        );
        console.log('✅ PDF 기록이 저장되었습니다. ID:', savedId);
      } catch (dbError) {
        console.error('❌ PDF 기록 저장 실패:', dbError);
        // 저장 실패해도 인쇄는 계속 진행
      }

      // 2. iframe 생성
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
          <title>${modelName || 'Robot Gripper'} Report</title>
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
              <div class="text-sm text-gray-500 mt-1">Project: ${modelName || 'Robot Gripper'} System</div>
            </div>
            <div class="text-xs text-gray-500">출력일: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold text-blue-600 border-l-4 border-blue-600 pl-3 mb-4">
              1. 모델링 스냅샷
            </h2>
            <div class="text-center border border-gray-200 p-6 rounded-lg bg-gray-50">
              <img src="${imgData}" class="max-w-full max-h-[400px] rounded shadow-sm mx-auto" />
            </div>
          </div>

          <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold text-blue-600 border-l-4 border-blue-600 pl-3 mb-4">
              2. 상세 사양 및 기술 이론
            </h2>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div class="text-xl font-extrabold text-gray-900 mb-2">${reportTitle}</div>
              <div class="text-[15px] text-gray-600 text-justify leading-7">
                ${reportDesc}
              </div>
            </div>
          </div>

          <div class="mb-10 break-inside-avoid">
            <h2 class="text-base font-bold text-blue-600 border-l-4 border-blue-600 pl-3 mb-4">
              3. AI 기술 질의응답
            </h2>
            <div class="bg-white">
              ${chatHtml}
            </div>
          </div>

        </body>
        </html>
      `);
      doc.close();

      // 인쇄 실행
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
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Share size={18} />}
      <span>{isLoading ? "생성 중..." : "내보내기"}</span>
    </button>
  );
};

export default ReportExporter;