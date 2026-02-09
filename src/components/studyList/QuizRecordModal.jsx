import React, { useEffect, useState } from 'react';
import { getAllQuizRecords, deleteQuizRecord } from '../../db/quizDB';
import { ChevronDown, ChevronRight, Folder, FileText, Trash2, CheckCircle, XCircle } from 'lucide-react';

// 모델 ID와 이름 매핑
const MODEL_NAMES = {
  '1': 'Drone',
  '2': 'Leaf Spring',
  '3': 'Machine Vice',
  '4': 'Robot Arm',
  '5': 'Robot Gripper',
  '6': 'Suspension',
  '7': 'V4 Engine'
};

const QuizRecordModal = ({ isOpen, onClose, allModels }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const allRecords = await getAllQuizRecords();
      setRecords(allRecords);
      
      // 기본값: 모든 폴더 접힌 상태
      setExpandedFolders(new Set());
    } catch (error) {
      console.error('❌ 퀴즈 기록 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModelInfo = (modelId) => {
    const model = allModels.find(m => m.objectId === modelId);
    return {
      name: MODEL_NAMES[modelId] || model?.name || '알 수 없음',
      type: model?.type || '기타',
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('이 퀴즈 기록을 삭제하시겠습니까?')) return;
    
    try {
      await deleteQuizRecord(id);
      loadRecords();
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error('❌ 퀴즈 기록 삭제 실패:', error);
      alert('퀴즈 기록 삭제에 실패했습니다.');
    }
  };

  const toggleFolder = (modelId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
  };

  const handleRecordClick = (record) => {
    setSelectedRecord(selectedRecord?.id === record.id ? null : record);
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 모델별로 퀴즈 기록 그룹화
  const groupedRecords = records.reduce((acc, record) => {
    if (!acc[record.modelId]) {
      acc[record.modelId] = [];
    }
    acc[record.modelId].push(record);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-50 rounded-lg w-[1000px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="t-20-semi text-gray-900">퀴즈 기록</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
          >
            ×
          </button>
        </div>

        {/* 퀴즈 기록 리스트 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-pulse">로딩 중...</div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 t-16-regular">저장된 퀴즈 기록이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(groupedRecords).map(([modelId, modelRecords]) => {
                const modelInfo = getModelInfo(modelId);
                const isExpanded = expandedFolders.has(modelId);
                
                return (
                  <div key={modelId} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* 폴더 헤더 */}
                    <div
                      onClick={() => toggleFolder(modelId)}
                      className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                      <Folder className="w-5 h-5 text-purple-500" />
                      <div className="flex-1">
                        <div className="t-16-semi text-gray-900">
                          {modelInfo.name}
                        </div>
                        <div className="t-12-regular text-gray-500">
                          {modelInfo.type} · {modelRecords.length}개의 퀴즈 기록
                        </div>
                      </div>
                    </div>

                    {/* 퀴즈 기록 리스트 */}
                    {isExpanded && (
                      <div className="bg-gray-50 border border-gray-4 rounded-lg divide-y divide-gray-100">
                        {modelRecords
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .map((record) => (
                            <div key={record.id}>
                              <div
                                onClick={() => handleRecordClick(record)}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 flex items-start gap-3">
                                    <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="t-15-semi text-gray-900">
                                          {record.difficulty === 'Hard' ? '어려움' : '일반'} 난이도
                                        </div>
                                        <span className={`t-16-semi ${getScoreColor(record.score, record.totalQuestions)}`}>
                                          {record.score}/{record.totalQuestions}점
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4 t-12-regular text-gray-500">
                                        <span className="flex items-center gap-1">
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          {formatDate(record.createdAt)}
                                        </span>
                                        <span className="text-green-600">맞음 {record.correctAnswers?.length || 0}개</span>
                                        <span className="text-red-600">틀림 {record.wrongAnswers?.length || 0}개</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(record.id);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="삭제"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>

                              {/* 상세 내용 (펼쳤을 때) */}
                              {selectedRecord?.id === record.id && (
                                <div className="px-4 pb-4 bg-gray-50 mt-5">
                                  {/* 맞은 문제 */}
                                  {record.correctAnswers && record.correctAnswers.length > 0 && (
                                    <div className="mb-4">
                                      <div className="flex items-center gap-2 mb-2 t-14-semi text-green-700">
                                        <CheckCircle size={16} />
                                        맞은 문제 ({record.correctAnswers.length}개)
                                      </div>
                                      <div className="space-y-2">
                                        {record.correctAnswers.map((qa, idx) => (
                                          <div key={idx} className="bg-white p-3 rounded-lg border border-green-200">
                                            <div className="t-13-semi text-gray-900 mb-1">
                                              Q{idx + 1}. {qa.question}
                                            </div>
                                            <div className="t-12-regular text-green-600">
                                              ✓ {qa.answer}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 틀린 문제 */}
                                  {record.wrongAnswers && record.wrongAnswers.length > 0 && (
                                    <div>
                                      <div className="flex items-center gap-2 mb-2 t-14-semi text-red-700">
                                        <XCircle size={16} />
                                        틀린 문제 ({record.wrongAnswers.length}개)
                                      </div>
                                      <div className="space-y-2">
                                        {record.wrongAnswers.map((qa, idx) => (
                                          <div key={idx} className="bg-white p-3 rounded-lg border border-red-200">
                                            <div className="t-13-semi text-gray-900 mb-1">
                                              Q{idx + 1}. {qa.question}
                                            </div>
                                            <div className="t-12-regular text-red-600 mb-1">
                                              ✗ 내 답: {qa.userAnswer}
                                            </div>
                                            <div className="t-12-regular text-green-600 mb-2">
                                              ✓ 정답: {qa.correctAnswer}
                                            </div>
                                            {qa.explanation && (
                                              <div className="t-12-regular text-gray-600 bg-gray-50 p-2 rounded">
                                                💡 {qa.explanation}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 통계 */}
        {!loading && records.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between t-13-regular text-gray-600">
              <span>총 {Object.keys(groupedRecords).length}개 모델</span>
              <span>전체 퀴즈 기록 {records.length}개</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizRecordModal;