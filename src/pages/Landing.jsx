import React from "react";
import { useNavigate } from "react-router-dom";

import Layer1 from "../assets/icons/icon-landing-1.png";
import Layer2 from "../assets/icons/icon-landing-2.svg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    /* 전체 배경을 아주 연한 회색으로 두어 투명 SVG가 잘 보이게 합니다 */
    <div className="relative w-full h-screen bg-slate-50 flex items-center justify-center overflow-hidden">
      {/* 1. 배경 레이어 (이미지 태그 방식 - 훨씬 확실하게 보입니다) */}
      <img
        src={Layer1}
        alt="Background Layer 1"
        className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
      />
      <img
        src={Layer2}
        alt="Background Layer 2"
        className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
      />

      {/* 2. 텍스트 및 버튼 컨테이너 (피그마 수치 적용) */}
      <div
        className="absolute z-50 flex flex-col items-start text-left"
        style={{
          left: "10%", // 피그마 가이드 왼쪽 여백
          top: "20%", // 피그마 가이드 상단 여백
        }}
      >
        <h1 className="text-[48px] text-[#4981AD] font-bold mb-6 tracking-tighter mb-[72px]">
          SIMVEX
        </h1>

        <p className="b-32-light text-[#262729] mb-10 max-w-2xl leading-relaxed break-keep">
          공학 분야 학생 및 연구자들을 위한{" "}
          <span className="font-bold text-[#1A1A1A]">3D 시각화</span>
          <br />
          시뮬레이션 기반 학습/연구개발 종합 소프트웨어
        </p>

        <p className="b-14-reg-160 text-[#5F6368] mb-20 max-w-2xl leading-relaxed break-keep font-normal">
          내장되어있는 다양한 전공 내용을 종합하여 나만의 새로운 융합지식과
          융합기술을 개발해보세요!
        </p>

        <button
          onClick={() => navigate("/study-list")}
          className="px-[32px] py-[16px] bg-[#AEC1EC] hover:bg-main-2 text-white t-20-bold rounded-[100px] active:scale-95"
        >
          SIMVEX 시작하기
        </button>
      </div>
    </div>
  );
};

export default Landing;
