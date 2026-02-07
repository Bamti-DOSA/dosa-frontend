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
      setAllModels(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    loadAllData();
  }, []);

  if (loading) return <div className="ml-[275px] p-10">로딩 중...</div>;

  const inProgressModels = allModels.filter((m) => m.status === "IN_PROGRESS");
  const categories = [...new Set(allModels.map((item) => item.type))].filter(Boolean);

  return (
    <div className="flex flex-row">
      <SideBar />
      <div className="ml-[275px] px-[60px] py-[46px] w-full bg-gray-50">
        <div className="mt-[46px] t-24-semi">학습 페이지</div>

        <div className="mt-[60px] mb-[40px]">
          <div className="flex flex-row justify-between items-center mb-[24px]">
            <div className="t-18-semi">진행 중인 학습</div>
          </div>
          <div className="flex flex-row gap-[16px] overflow-x-auto">
            {inProgressModels.map((model) => (
              <StudyCard
                key={model.objectId}
                objectId={model.objectId}
                title={model.name}
                category={model.type}
                isInProgress={true}
                date={model.updatedAt || "2026. 02. 07"}
                imgUrl={model.thumbnailUrl}
              />
            ))}
          </div>
          <hr className="border-b-[1px] border-gray-200 mt-[40px]" />
        </div>

        <div className="mt-[40px] flex flex-col gap-[80px]">
          {categories.map((catName) => (
            <StudySection
              key={catName}
              category={catName}
              models={allModels.filter((m) => m.type === catName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyList;
