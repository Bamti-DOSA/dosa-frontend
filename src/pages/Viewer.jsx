import React from "react";
import { Menu, Share } from "lucide-react"; 

import LeftContainer from "../components/viewer/LeftContainer";
import RightContainer from "../components/viewer/RightContainer";

const Viewer = () => {
  // 데이터 (API 연동 전 하드코딩)
  const partsData = [
    {
      id: "main_frame",
      name: "메인 프레임",
      description: "OnRobot Soft Gripper는 다양한 범위의 불규칙한 형태와 연약한 물체를 잡을 수 있어 식품과 음료 생산은 물론, 제조나 포장 산업에서의 픽앤플레이스 애플리케이션에 적합합니다.",
      model: "/models/Main frame.glb",
    },
    {
      id: "arm_gear",
      name: "암 기어",
      description: "모터 본체와 프레임을 연결하는 핵심 부품으로, 내부 기어 시스템을 통해 동력 손실 없이 날개에 강력한 회전 에너지를 전달합니다.",
      model: "/models/Arm gear.glb",
    },
    {
      id: "blade",
      name: "임펠러 블레이드",
      description: "공기역학적 설계를 통해 낮은 소음으로도 최대의 양력을 발생시킵니다. 수직 이착륙과 정밀한 방향 전환을 가능하게 하는 핵심 추진체입니다.",
      model: "/models/Impellar Blade.glb",
    },
    {
      id: "leg",
      name: "랜딩 레그",
      description: "이착륙 시 발생하는 물리적 충격을 흡수하여 정밀 센서와 메인 프레임을 보호합니다. 경사진 지면에서도 기체가 안정적으로 거치되도록 돕습니다.",
      model: "/models/Leg.glb",
    },
    {
      id: "beater_disc",
      name: "비터 디스크",
      description: "모터 상단에서 고속 회전 시 무게 중심을 완벽하게 잡아줍니다. 동시에 공기 흐름을 유도하여 모터에서 발생하는 열을 빠르게 식혀주는 역할을 합니다.",
      model: "/models/Beater disc.glb",
    },
    {
      id: "gearing",
      name: "기어링 시스템",
      description: "모터의 고속 회전을 주행에 적합한 힘으로 변환합니다. 각 축에 전달되는 동력을 일정하게 유지하여 부드럽고 안정적인 비행 성능을 완성합니다.",
      model: "/models/Gearing.glb",
    },
    {
      id: "nut_screw",
      name: "고정용 너트/볼트",
      description: "강한 진동에도 각 부품이 분리되지 않도록 단단히 고정합니다. 드론의 전체적인 강성을 높여 비행 중 발생할 수 있는 결합 이탈 사고를 방지합니다.",
      model: "/models/Nut.glb",
    },
    {
      id: "xyz_sensor",
      name: "XYZ 자이로 센서",
      description: "3축 기울기를 실시간으로 정밀하게 감지하여 비행 안정성을 유지합니다. 외부 환경 변화에도 드론이 수평을 잃지 않도록 돕는 브레인 역할을 합니다.",
      model: "/models/xyz.glb",
    },
  ];

  return (
    // 1. 전체 화면 배경 (회색)
    <div className="w-screen h-screen bg-[#E2E3E7] flex flex-col overflow-hidden font-sans">
      
      {/* 2. 상단 헤더 영역 */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 z-10">
        {/* 좌측: 메뉴 아이콘 + 타이틀 */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded hover:bg-gray-200 transition-colors">
            <Menu className="text-gray-700" size={24} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-3">
             {/* 로고 아이콘 (회색 박스 예시) */}
            <div className="w-8 h-8 bg-[#E2E3E7] rounded-lg shadow-sm"></div>
            <span className="text-xl font-extrabold text-gray-800 tracking-tight">Robot Gripper</span>
          </div>
        </div>

        {/* 우측: 내보내기 버튼 */}
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
          <Share size={18} />
          <span>내보내기</span>
        </button>
      </header>

      {/* 3. 메인 컨텐츠 영역 (흰색 둥근 카드) */}
      <main className="flex-1 px-6 pb-6 min-h-0">
        <div className="w-full h-full flex gap-6 bg-[#E2E3E7] ">
          
          {/* 왼쪽 컨테이너 (3D 뷰어, 리스트) - 70% */}
          <div className="w-[70%] h-full ">
             <LeftContainer partsData={partsData} />
          </div>

          {/* 오른쪽 컨테이너 (노트, AI) - 30% */}
          <div className="w-[30%] h-full ">
             <RightContainer />
          </div>

        </div>
      </main>
    </div>
  );
};

export default Viewer;