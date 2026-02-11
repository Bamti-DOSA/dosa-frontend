import SideBar from "../components/studyList/SideBar";
import StudyCard from "../components/studyList/StudyCard";
import StudySection from "../components/studyList/StudySection";
import React, { useEffect, useState } from "react";
import { getModels } from "../api/modelAPI";
import { getChatsByModel, getMemosByModel } from "../api/aiDB";
import { ArrowRight } from "lucide-react"; // ✅ 아이콘 추가

// 날짜 포맷팅 함수
const formatDate = (timestamp) => {
  if (!timestamp) return "날짜 없음";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}`;
};

const StudyList = () => {
  const [allModels, setAllModels] = useState([]); // 서버 원본 데이터
  const [processedModels, setProcessedModels] = useState([]); // 날짜 정보가 포함된 전체 데이터 ✅ 추가
  const [filteredModels, setFilteredModels] = useState([]);
  const [inProgressForHome, setInProgressForHome] = useState([]);
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

  // 2. 통합 필터링 로직
  useEffect(() => {
    const processData = async () => {
      if (allModels.length === 0) return;

      // 1. 모든 모델에 대해 날짜 정보 병합 작업 진행
      const modelsWithStatus = await Promise.all(
        allModels.map(async (model) => {
          try {
            const modelIdStr = String(model.objectId);
            const chats = await getChatsByModel(modelIdStr);
            const memos = await getMemosByModel(modelIdStr);

            const allActivities = [
              ...(chats || []).map(
                (c) => new Date(c.lastUpdated || c.timestamp || 0),
              ),
              ...(memos || []).map((m) => new Date(m.date || m.createdAt || 0)),
            ].filter((date) => !isNaN(date.getTime()));

            if (allActivities.length > 0) {
              const latestDate = new Date(Math.max(...allActivities));
              return {
                ...model,
                lastStudyDateStr: formatDate(latestDate),
                lastTimestamp: latestDate.getTime(),
                isInProgress: true,
              };
            }
            // 활동 내역이 없더라도 원본 데이터는 유지하되 날짜만 없음으로 표시
            return { ...model, lastStudyDateStr: null, isInProgress: false };
          } catch (e) {
            return { ...model, lastStudyDateStr: null, isInProgress: false };
          }
        }),
      );

      // 2. 가공된 전체 데이터를 저장 ✅ (이게 핵심입니다)
      setProcessedModels(modelsWithStatus);

      // 3. 진행 중인 리스트 (홈 상단 슬라이드용)
      const inProgressList = modelsWithStatus
        .filter((m) => m.isInProgress)
        .sort((a, b) => b.lastTimestamp - a.lastTimestamp);
      setInProgressForHome(inProgressList);

      // 4. 메뉴별 필터링
      if (activeMenu === "홈") {
        setFilteredModels(modelsWithStatus); // allModels 대신 가공된 데이터 사용
      } else if (activeMenu === "진행 중인 학습") {
        setFilteredModels(inProgressList);
      } else if (activeMenu === "북마크") {
        const bookmarks = JSON.parse(
          localStorage.getItem("bookmarked_models") || "[]",
        );
        setFilteredModels(
          modelsWithStatus.filter((m) => bookmarks.includes(m.objectId)),
        );
      }
    };

    processData();
  }, [activeMenu, allModels]);

  if (loading)
    return (
      <div className="ml-[275px] p-10 text-gray-400">데이터 로딩 중...</div>
    );

  const displayModels = filteredModels;
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

        {/* 🟢 상단 슬라이드 영역 수정됨 */}
        {activeMenu === "홈" && inProgressForHome.length > 0 && (
          <div className="mt-[60px] mb-[40px]">
            {/* 타이틀 + 전체보기 버튼 배치 */}
            <div className="flex justify-between items-center mb-[24px]">
              <div className="t-18-semi">진행 중인 학습</div>

              {/* ✅ 3개보다 많으면 전체보기 버튼 노출 */}
              {inProgressForHome.length > 3 && (
                <div
                  className="gap-[8px] flex flex-row text-[#5A5A5A] font-semibold cursor-pointer hover:text-black items-center b-16-semi"
                  onClick={() => setActiveMenu("진행 중인 학습")} // 클릭 시 메뉴 변경
                >
                  전체보기 <ArrowRight size={20} color="#5A5A5A" />
                </div>
              )}
            </div>

            <div className="flex flex-row gap-[16px] overflow-x-auto pb-4 scrollbar-hide">
              {/* ✅ 여기서 .slice(0, 3)을 해줘야 3개만 나옵니다! */}
              {inProgressForHome.slice(0, 3).map((model) => (
                <StudyCard
                  key={`home-slide-${model.objectId}`}
                  objectId={model.objectId}
                  title={model.name}
                  category={model.type}
                  isInProgress={true}
                  date={model.lastStudyDateStr || "날짜 없음"}
                  thumbnailUrl={model.thumbnailUrl}
                />
              ))}
            </div>
            <hr className="border-b-[1px] border-gray-200 mt-[40px]" />
          </div>
        )}

        {/* 하단 섹션 영역 */}
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
