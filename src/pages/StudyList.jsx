import SideBar from "../components/studyList/SideBar";
import StudyCard from "../components/studyList/StudyCard";
import StudySection from "../components/studyList/StudySection";
import React, { useEffect, useState } from "react";
import { getModels } from "../api/modelAPI";
import { getChatsByModel, getMemosByModel } from "../api/aiDB";

const StudyList = () => {
  const [allModels, setAllModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]); // 필터링된 상태 관리
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("홈");

  // 1. 초기 데이터 로드
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const data = await getModels();
        setAllModels(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ 데이터 로딩 실패:", error);
        setAllModels([]);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  // 2. 💡 [필터링 로직 핵심] 메뉴가 바뀔 때마다 실행되는 효과
  useEffect(() => {
    const applyFilter = async () => {
      if (activeMenu === "홈") {
        setFilteredModels(allModels);
        return;
      }

      if (activeMenu === "북마크") {
        const bookmarks = JSON.parse(
          localStorage.getItem("bookmarked_models") || "[]",
        );
        const filtered = allModels.filter((m) =>
          bookmarks.includes(m.objectId),
        );
        setFilteredModels(filtered);
        return;
      }

      if (activeMenu === "진행 중인 학습") {
        // ✨ DB 기록(채팅/메모)이 있는지 하나씩 확인
        const statusResults = await Promise.all(
          allModels.map(async (model) => {
            const chats = await getChatsByModel(String(model.objectId));
            const memos = await getMemosByModel(String(model.objectId));
            const isStarted =
              (chats && chats.length > 0) || (memos && memos.length > 0);
            return isStarted ? model : null;
          }),
        );
        setFilteredModels(statusResults.filter((m) => m !== null));
        return;
      }
    };

    applyFilter();
  }, [activeMenu, allModels]); // 메뉴나 모델 리스트가 바뀌면 다시 필터링

  if (loading)
    return (
      <div className="ml-[275px] p-10 text-gray-400">데이터 로딩 중...</div>
    );

  // 상단 슬라이드용 (서버 status 기준 유지)
  const inProgressForHome = allModels.filter((m) => m.status === "IN_PROGRESS");

  // 💡 카테고리는 '필터링된 결과'에서만 추출
  const categories = [
    ...new Set(filteredModels.map((item) => item.type)),
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

        {/* 홈 메뉴일 때만 상단 슬라이드 노출 */}
        {activeMenu === "홈" && inProgressForHome.length > 0 && (
          <div className="mt-[60px] mb-[40px]">
            <div className="t-18-semi mb-[24px]">진행 중인 학습</div>
            <div className="flex flex-row gap-[16px] overflow-x-auto pb-4">
              {inProgressForHome.map((model) => (
                <StudyCard
                  key={`home-${model.objectId}`}
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

        {/* 필터링된 결과 섹션 */}
        <div className="mt-[40px] flex flex-col gap-[60px]">
          {categories.length > 0 ? (
            categories.map((catName) => (
              <StudySection
                key={`${activeMenu}-${catName}`}
                category={catName}
                models={filteredModels.filter((m) => m.type === catName)}
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
