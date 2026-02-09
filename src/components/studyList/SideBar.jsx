import { useState } from "react";
import {
  Home,
  BookOpen,
  Bookmark,
  FileText,
  Sparkles,
  FolderMinus,
  Share,
  Twitch,
  TrendingUp,
} from "lucide-react";
import QuizModal from "./QuizModal";
import NotesModal from "./NotesModal";
import PdfModal from "./PdfModal";
import QuizRecordModal from "./QuizRecordModal";

const SideBar = ({ activeMenu, setActiveMenu, allModels = [] }) => {
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [quizRecordModalOpen, setQuizRecordModalOpen] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const handleQuizClick = () => {
    setActiveMenu("퀴즈");
    setQuizModalOpen(true);
  };

  const handleNotesClick = () => {
    setActiveMenu("메모 리스트");
    setNotesModalOpen(true);
  };

  const handlePdfClick = () => {
    setActiveMenu("PDF 출력");
    setPdfModalOpen(true);
  };

  const handleQuizRecordClick = () => {
    setActiveMenu("퀴즈 기록");
    setQuizRecordModalOpen(true);
  };

  const handleWorkflowClick = () => {
    setActiveMenu("워크 플로우");
    setShowDevModal(true);
  };

  const navGroups = [
    {
      title: "학습",
      items: [
        { name: "진행 중인 학습", icon: BookOpen },
        { name: "북마크", icon: Bookmark },
      ],
    },
    {
      title: "기록",
      items: [
        { name: "메모 리스트", icon: FileText, onClick: handleNotesClick },
        { name: "AI 대화 내역", icon: Sparkles },
        { name: "퀴즈 기록", icon: FolderMinus, onClick: handleQuizRecordClick },
        { name: "PDF 출력", icon: Share, onClick: handlePdfClick },
      ],
    },
    {
      title: "추가 학습",
      items: [
        { name: "퀴즈", icon: Twitch, onClick: handleQuizClick },
        { name: "워크 플로우", icon: TrendingUp, onClick: handleWorkflowClick },
      ],
    },
  ];

  return (
    <>
      <div className="bg-[#EDF2F6] fixed top-0 flex flex-col p-[20px] w-[275px] min-h-screen border-r border-[#EEEEEE] shrink-0 font-['Pretendard']">
        {/* 로고 영역 */}
        <div className="flex items-center mb-[48px] gap-3">
          <div className="w-[32px] h-[32px] bg-[#D3D3D3] rounded-[4px]" />
          <div className="t-20-bold">SIMVEX</div>
        </div>

        <div className="mb-[32px]">
          <div
            onClick={() => setActiveMenu("홈")}
            className={`
              flex items-center gap-[8px] w-full p-[10px] rounded-[8px] cursor-pointer b-16-bold
              ${
                activeMenu === "홈"
                  ? "bg-bg-1 text-main-1"
                  : "text-gray-800 hover:bg-bg-1"
              }
            `}
          >
            <Home
              size={20}
              color={activeMenu === "홈" ? "#4981AD" : "#3A3C40"}
              strokeWidth={activeMenu === "홈" ? 2.5 : 2}
            />
            홈
          </div>
        </div>

        <nav className="flex flex-col gap-[32px] w-full">
          {navGroups.map((group) => (
            <div key={group.title} className="w-full items-start">
              <div className="text-[#00000066] b-14-med mb-[16px] px-[10px]">
                {group.title}
              </div>

              <div className="flex flex-col gap-[4px] w-full">
                {group.items.map((item) => {
                  const isActive = activeMenu === item.name;
                  const IconComponent = item.icon;

                  return (
                    <div
                      key={item.name}
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick();
                        } else {
                          setActiveMenu(item.name);
                        }
                      }}
                      className={`
                        flex items-center gap-[8px] w-full p-[10px] rounded-[8px] cursor-pointer
                        text-[16px] leading-[120%] 
                        ${
                          isActive
                            ? "bg-bg-1 text-main-1 font-bold"
                            : "text-gray-800 hover:bg-bg-1 font-medium"
                        }
                      `}
                    >
                      <IconComponent
                        size={20}
                        color={isActive ? "#4981AD" : "#3A3C40"}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      {item.name}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <QuizModal
        isOpen={quizModalOpen}
        onClose={() => {
          setQuizModalOpen(false);
          setActiveMenu("홈");
        }}
      />

      <NotesModal
        isOpen={notesModalOpen}
        onClose={() => {
          setNotesModalOpen(false);
          setActiveMenu("홈");
        }}
        allModels={allModels}
      />

      <PdfModal
        isOpen={pdfModalOpen}
        onClose={() => {
          setPdfModalOpen(false);
          setActiveMenu("홈");
        }}
        allModels={allModels}
      />

      <QuizRecordModal
        isOpen={quizRecordModalOpen}
        onClose={() => {
          setQuizRecordModalOpen(false);
          setActiveMenu("홈");
        }}
        allModels={allModels}
      />

      {/* 개발중 모달 */}
      {showDevModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[400px] p-8 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="t-24-bold mb-3">개발 중입니다</h2>
              <p className="text-gray-600 t-16-regular mb-6">
                워크플로우 기능은 현재 개발 중입니다.<br />
                곧 만나보실 수 있습니다!
              </p>
              <button
                onClick={() => {
                  setShowDevModal(false);
                  setActiveMenu("홈");
                }}
                className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all t-16-semi"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
