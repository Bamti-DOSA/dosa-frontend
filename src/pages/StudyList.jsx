import SideBar from "../components/studyList/SideBar";
import StudyCard from "../components/studyList/StudyCard";
import StudySection from "../components/studyList/StudySection";
import React, { useEffect, useState, useCallback } from "react";
import { getModels } from "../api/modelAPI";
import { getChatsByModel, getMemosByModel } from "../api/aiDB";

const StudyList = () => {
  const [allModels, setAllModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [inProgressForHome, setInProgressForHome] = useState([]); // 상단 슬라이드용
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("홈");

  // 1. 초기 데이터 가져오기
  useEffect(() => {
    const initData = async () => {
      try {
        const data = await getModels();
        const modelData = Array.isArray(data) ? data : [];
        setAllModels(modelData);
      } catch (error) {
        console.error("❌ 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // 2. 필터링 로직 하나로 합치기
  useEffect(() => {
    const applyFilterAndProgress = async () => {
      if (allModels.length === 0) return;

      // [공통] 채팅/메모 기록이 있는 모델 찾기 (상단 슬라이드용)
      const statusResults = await Promise.all(
        allModels.map(async (model) => {
          const chats = await getChatsByModel(String(model.objectId));
          const memos = await getMemosByModel(String(model.objectId));
          const isStarted =
            (chats && chats.length > 0) || (memos && memos.length > 0);
          return isStarted ? model : null;
        }),
      );

      const inProgressModels = statusResults.filter((m) => m !== null);

      // 상단 슬라이드 데이터 업데이트
      setInProgressForHome(inProgressModels);

      // 메뉴에 따른 하단 리스트 필터링
      if (activeMenu === "홈") {
        setFilteredModels(allModels);
      } else if (activeMenu === "진행 중인 학습") {
        setFilteredModels(inProgressModels);
      } else if (activeMenu === "북마크") {
        const bookmarks = JSON.parse(
          localStorage.getItem("bookmarked_models") || "[]",
        );
        setFilteredModels(
          allModels.filter((m) => bookmarks.includes(m.objectId)),
        );
      }
    };

    applyFilterAndProgress();
  }, [activeMenu, allModels]);

  if (loading)
    return (
      <div className="ml-[275px] p-10 text-gray-400">데이터 로딩 중...</div>
    );

  // 홈일 때는 전체, 아닐 때는 필터링된 결과 사용
  const displayModels = activeMenu === "홈" ? allModels : filteredModels;
  const categories = [
    ...new Set(displayModels.map((item) => item.type)),
  ].filter(Boolean);

  return (
    <div className="flex flex-row min-h-screen bg-gray-50">
      <SideBar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        allModels={allModels}
      />

      <div className="ml-[275px] px-[60px] py-[46px] w-full">
        <div className="mt-[46px] t-24-semi text-gray-900">
          {activeMenu === "홈" ? "학습 페이지" : activeMenu}
        </div>

        {/* 홈 메뉴일 때만 상단 '진행 중인 학습' 슬라이드 노출 */}
        {activeMenu === "홈" && inProgressForHome.length > 0 && (
          <div className="mt-[60px] mb-[40px]">
            <div className="t-18-semi mb-[24px]">진행 중인 학습</div>
            <div className="flex flex-row gap-[16px] overflow-x-auto pb-4">
              {inProgressForHome.map((model) => (
                <StudyCard
                  key={`home-slide-${model.objectId}`}
                  objectId={model.objectId}
                  title={model.name}
                  category={model.type}
                  isInProgress={true}
                  date={model.updatedAt || "2026. 02. 07"}
                  thumbnailUrl={model.thumbnailUrl}
                />
              ))}
            </div>
            <hr className="border-b-[1px] border-gray-200 mt-[40px]" />
          </div>
        )}

        {/* 결과 섹션 */}
        <div className="mt-[40px] flex flex-col gap-[60px]">
          {categories.length > 0 ? (
            categories.map((catName) => (
              <StudySection
                key={`${activeMenu}-${catName}`}
                category={catName}
                models={displayModels.filter((m) => m.type === catName)}
                filterType={activeMenu}
              />
            ))
          ) : (
            <div className="mt-32 flex flex-col items-center justify-center text-gray-400">
              <span className="text-6xl mb-4 opacity-20">📁</span>
              <p className="t-16-med">{activeMenu} 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyList;
