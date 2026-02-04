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

const SideBar = () => {
  const [activeMenu, setActiveMenu] = useState("진행 중인 학습");

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
        { name: "메모 리스트", icon: FileText },
        { name: "AI 대화 내역", icon: Sparkles },
        { name: "퀴즈 기록", icon: FolderMinus },
        { name: "PDF 출력", icon: Share },
      ],
    },
    {
      title: "추가 학습",
      items: [
        { name: "퀴즈", icon: Twitch },
        { name: "워크 플로우", icon: TrendingUp },
      ],
    },
  ];

  return (
    <div className="bg-[#EDF2F6] flex flex-col p-[20px] w-[275px] min-h-screen border-r border-[#EEEEEE] shrink-0 font-['Pretendard']">
      {/* 로고 영역 */}
      <div className="flex items-center gap-3 mb-[49px] px-[8px]">
        <div className="w-[32px] h-[32px] bg-[#B5C0C6] rounded-[4px]" />
        <div className="text-[20px] font-bold tracking-tight text-black">
          SIMVEX
        </div>
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
            {/* 섹션 제목: Detail 12 Reg 스타일 적용 (12px, 160%, -1%) */}
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
                    onClick={() => setActiveMenu(item.name)}
                    className={`
                      flex items-center gap-[8px] w-full p-[10px] rounded-[8px] cursor-pointer
                      text-[16px] leading-[120%] 
                      ${
                        isActive
                          ? "bg-bg-1 text-main-1 font-bold" // 활성화: bg-1, main-1
                          : "text-gray-800 hover:bg-bg-1 font-medium"
                      }
                    `}
                  >
                    <IconComponent
                      size={20}
                      color={isActive ? "#4981AD" : "#3A3C40"} // 활성화 시 main-1 적용
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
  );
};

export default SideBar;
