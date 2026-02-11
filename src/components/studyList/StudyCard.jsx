import React, { useState, useEffect } from "react";
import { Bookmark, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAssemblyModelSignedUrl } from "../../api/modelAPI";

const StudyCard = ({
  category,
  title,
  date,
  isInProgress = false,
  thumbnailUrl,
  objectId,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const bookmarks = JSON.parse(
      localStorage.getItem("bookmarked_models") || "[]",
    );
    setIsBookmarked(bookmarks.includes(objectId));
  }, [objectId]);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (!thumbnailUrl) {
        setLoading(false);
        return;
      }

      try {
        if (
          thumbnailUrl.startsWith("http://") ||
          thumbnailUrl.startsWith("https://")
        ) {
          setImageUrl(thumbnailUrl);
        } else {
          const signedUrl = await getAssemblyModelSignedUrl(thumbnailUrl);
          if (signedUrl && signedUrl.startsWith("http")) {
            setImageUrl(signedUrl);
          }
        }
      } catch (error) {
        console.error(`❌ [${title}] 썸네일 로드 실패:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadThumbnail();
  }, [thumbnailUrl, title]);

  const toggleBookmark = (e) => {
    e.stopPropagation();
    const bookmarks = JSON.parse(
      localStorage.getItem("bookmarked_models") || "[]",
    );
    let updated;
    if (isBookmarked) {
      updated = bookmarks.filter((id) => id !== objectId);
    } else {
      updated = [...bookmarks, objectId];
    }
    localStorage.setItem("bookmarked_models", JSON.stringify(updated));
    setIsBookmarked(!isBookmarked);
  };

  const handleCardClick = () => {
    if (objectId) {
      navigate(`/viewer/${objectId}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white flex flex-col w-[248px] h-[256px] p-[16px] rounded-[8px] hover:shadow-md cursor-pointer  transition-shadow relative"
    >
      {/* 썸네일 이미지 - 중앙 정렬 */}
      {imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-30 pointer-events-none">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-[200px] max-h-[180px] object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      <div className="h-[151px] relative z-10">
        <div className="flex justify-between items-start mb-[16px]">
          <span className="b-14-semi text-gray-7">{category}</span>
          <button
            onClick={toggleBookmark}
            className="transition-transform active:scale-90"
          >
            <Bookmark
              size={20}
              color={isBookmarked ? "#4B85E2" : "#ADB4BC"}
              fill={isBookmarked ? "#4B85E2" : "none"}
              strokeWidth={isBookmarked ? 2.5 : 2}
              className="transition-colors duration-200"
            />
          </button>
        </div>

        <h2 className="t-24-bold relative z-10">{title}</h2>
      </div>

      <div className="mt-[8px] flex-grow flex flex-col gap-[16px] relative z-10">
        <div className="flex flex-row items-center justify-start gap-[6px] text-gray-6">
          <Calendar color="#888E96" size={12} />
          <span className="text-[12px] font-medium">{date}</span>
        </div>
        <button
          className={
            "text-white py-[8px] px-[10px] w-full rounded-[8px] cursor-pointer b-16-semi transition-colors " +
            (isInProgress
              ? "bg-acc-red-light hover:bg-acc-red"
              : "bg-gray-7 hover:bg-gray-8")
          }
        >
          {isInProgress ? "학습 이어하기" : "학습 시작하기"}
        </button>
      </div>
    </div>
  );
};

export default StudyCard;
