import SideBar from "../components/studyList/SideBar";
import StudyCard from "../components/studyList/StudyCard";
import StudySection from "../components/studyList/StudySection";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getModels } from "../api/modelAPI";

const StudyList = () => {
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      const data = await getModels();
      // api/modelApi.js에서 이미 result.data를 반환하므로 바로 배열로 세팅
      setAllModels(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    loadAllData();
  }, []);

  if (loading) return <div className="ml-[275px] p-10">로딩 중...</div>;

  // 1. 진행 중인 학습 필터링 (필드명이 있다면 적용, 없다면 임시 주석)
  const inProgressModels = allModels.filter((m) => m.status === "IN_PROGRESS");

  // 2. 중요: 이미지처럼 카테고리(type) 목록을 중복 없이 추출
  const categories = [...new Set(allModels.map((item) => item.type))].filter(
    Boolean,
  );

  return (
    <div className="flex flex-row">
      <SideBar />
      <div className="ml-[275px] px-[60px] py-[46px] w-full bg-gray-50">
        <div className="mt-[46px] t-24-semi">학습 페이지</div>

        {/* 상단: 진행 중인 학습 섹션 (이미지 상단에 따로 있다면 유지) */}

        <div className="mt-[60px] mb-[40px]">
          <div className="flex flex-row justify-between items-center mb-[24px]">
            <div className="t-18-semi">진행 중인 학습</div>
          </div>
          <div className="flex flex-row gap-[16px] overflow-x-auto">
            {inProgressModels.map((model) => (
              <StudyCard
                key={model.objectId}
                title={model.name}
                category={model.type}
                isInProgress={true}
                date={model.updatedAt || "2026. 02. 07"}
              />
            ))}
          </div>
          <hr className="border-b-[1px] border-gray-200 mt-[40px]" />
        </div>

        {/* 하단: 카테고리별 섹션 (이미지처럼 type별로 그룹화) */}
        <div className="mt-[40px] flex flex-col gap-[80px]">
          {categories.map((catName) => (
            <StudySection
              key={catName}
              category={catName} // Robotics & Automation 등
              // 해당 카테고리에 속한 데이터만 필터링해서 전달
              models={allModels.filter((m) => m.type === catName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyList;
