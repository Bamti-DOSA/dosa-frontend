import { getAssemblyModelSignedUrl } from "../api/modelAPI";

// 1. Drone 파일명 매핑
const DRONE_FILE_MAP = {
  arm_gear: "Arm gear.glb",
  beater_disc: "Beater disc.glb",
  gearing: "Gearing.glb",
  impellar_blade: "Impellar Blade.glb",
  leg: "Leg.glb",
  main_frame: "Main frame.glb",
  main_frame_mir: "Main frame_MIR.glb",
  nut: "Nut.glb",
  screw: "Screw.glb",
  xyz: "xyz.glb",
};

// 2. LeafSpring 파일명 매핑
const LEAF_SPRING_FILE_MAP = {
  clamp_center: "Clamp-Center.glb",
  clamp_primary: "Clamp-Primary.glb",
  clamp_secondary: "Clamp-Secondary.glb",
  leaf_layer: "Leaf-Layer.glb",
  support_chassis_rigid: "Support-Chassis Rigid.glb",
  support_chassis: "Support-Chassis.glb",
  support_rubber_60mm: "Support-Rubber 60mm.glb",
  support_rubber: "Support-Rubber.glb",
  support: "Support.glb",
};

// 3. Machine Vice 파일명 매핑
const MACHINE_VICE_FILE_MAP = {
  part_1_fuhrung: "Part1 Fuhrung.glb",
  part_2_feste_backe: "Part2 Feste Backe.glb",
  part_3_lose_backe: "Part3-lose backe.glb",
  part_4_spindelsockel: "Part4 spindelsockel.glb",
  part_5_spannbacke: "Part5-Spannbacke.glb",
  part_6_fuhrungschiene: "Part6-fuhrungschiene.glb",
  part_7_trapez_spindel: "Part7-TrapezSpindel.glb",
  part_8_grundplatte: "Part8-grundplatte.glb",
};

// 4. RobotArm 파일명 매핑
const ROBOT_ARM_FILE_MAP = {
  // "API meshName": "로컬 파일명"
  "base": "base.glb",
  "part_2": "part_2.glb",
  "part_3": "part_3.glb",
  "part_4": "part_4.glb",
  "part_5": "part_5.glb",
  "part_6": "part_6.glb",
  "part_7": "part_7.glb",
  "part_8": "part_8.glb",
};

// 5. RobotGripper 파일명 매핑
const ROBOT_GRIPPER_FILE_MAP = {
  base_gear: "Base Gear.glb",
  base_mounting_bracket: "Base Mounting bracket.glb",
  base_plate: "Base Plate.glb",
  gear_link_1: "Gear link 1.glb",
  gear_link_2: "Gear link 2.glb",
  gripper: "Gripper.glb",
  link: "Link.glb",
  pin: "Pin.glb",
};

// 6. Suspension 파일명 매핑
const SUSPENSION_FILE_MAP = {
  base: "BASE.glb",
  nit: "NIT.glb",
  nut: "NUT.glb",
  rod: "ROD.glb",
  spring: "SPRING.glb",
};

// 7. V4 Engine 파일명 매핑
const V4_ENGINE_FILE_MAP = {
  connecting_rod_cap: "Connecting Rod Cap.glb",
  connecting_rod: "Connecting Rod.glb",
  conrod_bolt: "Conrod Bolt.glb",
  crankshaft: "Crankshaft.glb",
  piston_pin: "Piston Pin.glb",
  piston_ring: "Piston Ring.glb",
  piston: "Piston.glb",
};

// FILE_MAP_BY_MODEL
export const FILE_MAP_BY_MODEL = {
  Drone: DRONE_FILE_MAP,
  "Leaf Spring": LEAF_SPRING_FILE_MAP,
  "Machine Vice": MACHINE_VICE_FILE_MAP,
  "Robot Arm": ROBOT_ARM_FILE_MAP,
  "Robot Gripper": ROBOT_GRIPPER_FILE_MAP,
  Suspension: SUSPENSION_FILE_MAP,
  "V4 Engine": V4_ENGINE_FILE_MAP,
};

// 하드코딩된 부품 정보
const HARDCODED_PARTS = {
  Drone: [
    { 
      meshName: "arm_gear", 
      name: "Arm Gear", 
      description: "모터와 프로펠러를 연결하는 회전 기어입니다.\n무게: 약 15g\n\n⚠️ 주의사항: 기어 이빨 손상 시 즉시 교체 필요\n\n📖 시험 포인트:\n- 기어비(Gear Ratio) 계산법\n- 토크 전달 효율 분석\n- 고속 회전 시 응력 분포" 
    },
    { 
      meshName: "beater_disc", 
      name: "Beater Disc", 
      description: "프로펠러 회전을 안정화시키는 디스크형 부품입니다.\n무게: 약 8g\n\n⚠️ 주의사항: 균형이 맞지 않으면 심한 진동 발생\n\n📖 시험 포인트:\n- 회전 관성 모멘트 계산\n- 진동 감쇠 원리\n- 무게 중심과 회전 안정성의 관계" 
    },
    { 
      meshName: "gearing", 
      name: "Gearing", 
      description: "모터의 회전력을 프로펠러에 최적화하여 전달하는 기어 시스템입니다.\n무게: 약 25g\n\n⚠️ 주의사항: 윤활유 부족 시 마모 급증, 정기적인 윤활 필요\n\n📖 시험 포인트:\n- 기어 트레인 설계 원리\n- 감속비와 효율의 관계\n- 백래시(backlash) 개념과 영향" 
    },
    { 
      meshName: "impellar_blade", 
      name: "Impellar Blade", 
      description: "베르누이 원리로 양력을 발생시켜 드론을 띄우는 회전 날개입니다.\n무게: 약 12g\n\n⚠️ 주의사항: 균열이나 변형 시 비행 불안정, 정기 점검 필수\n\n📖 시험 포인트:\n- 양력 공식 (L = ½ρv²SC_L)\n- 받음각(Angle of Attack)과 양력의 관계\n- 블레이드 피치(Pitch) 조정 원리" 
    },
    { 
      meshName: "leg", 
      name: "Landing Leg", 
      description: "착륙 시 충격을 흡수하고 본체를 보호하는 다리입니다.\n무게: 약 20g\n\n⚠️ 주의사항: 착륙 각도 15도 이상 시 파손 위험\n\n📖 시험 포인트:\n- 충격 에너지 흡수율 계산\n- 스프링 상수(k)와 변형량의 관계\n- 탄성 한계와 영구 변형" 
    },
    { 
      meshName: "main_frame", 
      name: "Main Frame", 
      description: "드론의 모든 부품을 지지하는 주요 구조 프레임입니다.\n무게: 약 85g\n\n⚠️ 주의사항: 모터 장착 구멍 나사산 손상 주의, 과도한 힘 금지\n\n📖 시험 포인트:\n- 응력 집중부 설계 원리\n- 인장/압축 강도 계산\n- 경량화와 강성의 Trade-off 관계" 
    },
    { 
      meshName: "main_frame_mir", 
      name: "Main Frame Mirror", 
      description: "메인 프레임과 대칭을 이루어 무게 균형을 유지하는 프레임입니다.\n무게: 약 85g\n\n⚠️ 주의사항: 좌우 무게 차이 5g 이상 시 비행 불안정\n\n📖 시험 포인트:\n- 질량 중심(Center of Mass) 계산\n- 대칭성과 안정성의 관계\n- 관성 모멘트 균형 이론" 
    },
    { 
      meshName: "nut", 
      name: "Hex Nut", 
      description: "나사와 결합하여 부품을 단단히 고정하는 육각 너트입니다.\n규격: M3\n무게: 약 0.8g\n\n⚠️ 주의사항: 토크렌치로 0.5N·m로 조임 필수\n\n📖 시험 포인트:\n- 나사의 원리 (경사면 응용)\n- 체결력과 마찰력의 관계\n- 조임 토크 계산법" 
    },
    { 
      meshName: "screw", 
      name: "Socket Head Screw", 
      description: "부품들을 연결하고 고정하는 육각 구멍 나사입니다.\n규격: M3×10mm\n무게: 약 1.2g\n\n⚠️ 주의사항: 과도한 조임 시 나사산 손상\n\n📖 시험 포인트:\n- 나사 피치와 리드의 차이\n- 유효 단면적 계산\n- 전단 응력과 인장 응력 분석" 
    },
    { 
      meshName: "xyz", 
      name: "XYZ Motion Controller", 
      description: "드론의 3축 움직임을 제어하는 핵심 모듈입니다.\n무게: 약 35g\n\n⚠️ 주의사항: 자기장 간섭 주의 (자석 10cm 이내 금지)\n\n📖 시험 포인트:\n- 오일러 각도 (Roll/Pitch/Yaw)\n- PID 제어 원리\n- 센서 융합(Sensor Fusion) 알고리즘" 
    },
  ],
  "Leaf Spring": [
    { 
      meshName: "clamp_center", 
      name: "Center Clamp", 
      description: "리프 스프링의 중앙을 고정하여 전체 구조를 안정화시키는 클램프입니다.\n무게: 약 1.2kg\n\n⚠️ 주의사항: 체결 토크 120N·m 준수 필수\n\n📖 시험 포인트:\n- 클램핑력 계산\n- 볼트 전단 응력 분석\n- 스프링 중앙 고정의 역학적 의미" 
    },
    { 
      meshName: "clamp_primary", 
      name: "Primary U-Bolt Clamp", 
      description: "리프 스프링을 차축에 단단히 고정하는 주요 U볼트 클램프입니다.\n무게: 약 800g\n\n⚠️ 주의사항: U볼트 피로 균열 정기 점검 필수\n\n📖 시험 포인트:\n- U볼트의 응력 분포\n- 체결 순서 (대각선 조임 이유)\n- 스프링 시트 각도의 중요성" 
    },
    { 
      meshName: "clamp_secondary", 
      name: "Secondary Clamp Plate", 
      description: "하중을 분산시키고 미끄럼을 방지하는 보조 클램프 플레이트입니다.\n무게: 약 600g\n\n⚠️ 주의사항: 플레이트 변형 시 스프링 손상 위험\n\n📖 시험 포인트:\n- 접촉 응력 분포 계산\n- 마찰계수와 체결력의 관계\n- 플레이트 두께 설계 기준" 
    },
    { 
      meshName: "leaf_layer", 
      name: "Leaf Spring Layer", 
      description: "충격을 흡수하고 분산시키는 탄성 강판 레이어입니다.\n두께: 6~10mm (5장 적층)\n무게: 약 18kg\n\n⚠️ 주의사항: 층간 마찰로 인한 소음 발생 시 윤활 필요\n\n📖 시험 포인트:\n- 스프링 상수 계산 (k = nEbt³/12L³)\n- 적층 효과와 응력 분산\n- 피로 한계와 수명 예측" 
    },
    { 
      meshName: "support_chassis_rigid", 
      name: "Rigid Chassis Bracket", 
      description: "차체와 리프 스프링을 고정 결합하는 강성 지지대입니다.\n무게: 약 3.5kg\n\n⚠️ 주의사항: 용접부 균열 정기 점검 필수\n\n📖 시험 포인트:\n- 강성(Stiffness)과 유연성의 차이\n- 하중 전달 경로 분석\n- 응력 집중 완화 설계 방법" 
    },
    { 
      meshName: "support_chassis", 
      name: "Chassis Spring Hanger", 
      description: "스프링의 전후 움직임을 허용하는 섀시 행거입니다.\n무게: 약 2.8kg\n\n⚠️ 주의사항: 핀 구멍 마모 정기 점검 필요\n\n📖 시험 포인트:\n- 회전 중심축 설계 원리\n- 베어링 하중 계산\n- 스프링 아이(Eye)와 부싱의 역할" 
    },
    { 
      meshName: "support_rubber_60mm", 
      name: "60mm Rubber Bushing", 
      description: "진동과 소음을 감소시키는 60mm 규격 고무 완충재입니다.\n경도: 70 Shore A\n무게: 약 150g\n\n⚠️ 주의사항: 온도 범위 -30~80℃ 준수\n\n📖 시험 포인트:\n- 고무의 점탄성 특성\n- 히스테리시스 손실\n- 경도와 감쇠 성능의 관계" 
    },
    { 
      meshName: "support_rubber", 
      name: "Isolation Rubber Pad", 
      description: "금속 부품 간 마찰을 줄이고 충격을 흡수하는 방진 패드입니다.\n무게: 약 80g\n\n⚠️ 주의사항: 오일 접촉 시 팽윤 발생 주의\n\n📖 시험 포인트:\n- 진동 전달률 계산\n- 고유 진동수와 공진\n- 고무의 크리프 현상" 
    },
    { 
      meshName: "support", 
      name: "Spring Support Base", 
      description: "리프 스프링 시스템 전체를 지지하는 기본 베이스입니다.\n무게: 약 4.2kg\n\n⚠️ 주의사항: 용접 열영향부(HAZ) 강도 저하 주의\n\n📖 시험 포인트:\n- 하중 분산 설계 원리\n- 용접 강도 계산\n- 피로 균열 성장 속도와 안전율" 
    },
  ],
  "Robot Gripper": [
    { 
      meshName: "base_gear", 
      name: "Actuation Gear", 
      description: "그리퍼의 개폐 동작을 위한 동력을 전달하는 구동 기어입니다.\n모듈: 1.5, 잇수: 48\n무게: 약 180g\n\n⚠️ 주의사항: 기어 윤활유 6개월 주기 교체\n\n📖 시험 포인트:\n- 기어 모듈과 피치의 관계\n- 피치원 직경 계산\n- 물림률(Contact Ratio)" 
    },
    { 
      meshName: "base_mounting_bracket", 
      name: "Quick-Change Bracket", 
      description: "로봇 암에 그리퍼를 신속하게 장착하기 위한 퀵체인지 브라켓입니다.\n교체 시간: 10초 이내\n무게: 약 250g\n\n⚠️ 주의사항: 잠금 확인 센서 필수\n\n📖 시험 포인트:\n- 퀵체인지 메커니즘\n- 위치 반복 정밀도\n- 자동화 시스템 연동 방식" 
    },
    { 
      meshName: "base_plate", 
      name: "Gripper Base Plate", 
      description: "그리퍼의 구조적 기반을 제공하는 베이스 플레이트입니다.\n무게: 약 320g\n\n⚠️ 주의사항: 고정 나사 4개 균등 조임\n\n📖 시험 포인트:\n- 강성 설계 원리\n- 진동 고유 진동수\n- 공진 회피 설계" 
    },
    { 
      meshName: "gear_link_1", 
      name: "Primary Link Arm", 
      description: "기어의 회전 운동을 직선 운동으로 변환하는 주 연결 암입니다.\n무게: 약 85g\n\n⚠️ 주의사항: 핀 구멍 간극 0.05mm 이내 유지\n\n📖 시험 포인트:\n- 4절 링크 기구학\n- 그라쇼프 정리(Grashof's Theorem)\n- 기구 이득(Mechanical Advantage)" 
    },
    { 
      meshName: "gear_link_2", 
      name: "Secondary Link Arm", 
      description: "그리퍼 집게의 동작을 연동시켜 평행 파지를 구현하는 링크입니다.\n무게: 약 85g\n\n⚠️ 주의사항: 좌우 동기화 오차 ±0.3mm 이내\n\n📖 시험 포인트:\n- 평행 링크 기구\n- 동기화 메커니즘\n- 백래시 누적 오차 분석" 
    },
    { 
      meshName: "gripper", 
      name: "Parallel Jaw", 
      description: "물체를 실제로 잡는 집게 부분입니다.\n최대 파지력: 150N\n스트로크: 40mm\n무게: 약 65g\n\n⚠️ 주의사항: 미끄럼 방지 패드 마모 점검\n\n📖 시험 포인트:\n- 파지력 계산\n- 마찰계수와 안전율\n- Form/Force Closure 조건" 
    },
    { 
      meshName: "link", 
      name: "Coupling Link", 
      description: "각 부품을 연결하고 동작을 동기화하는 연결 링크입니다.\n무게: 약 45g\n\n⚠️ 주의사항: 핀 베어링 100만 사이클 교체\n\n📖 시험 포인트:\n- 링크 속도비\n- 각속도 관계\n- 순간 중심(Instantaneous Center)" 
    },
    { 
      meshName: "pin", 
      name: "Pivot Pin", 
      description: "관절의 회전축 역할을 하는 핀으로 부품 간 연결점입니다.\n표면 경도: HRC 58\n무게: 약 12g\n\n⚠️ 주의사항: 전단 응력 한계 200MPa\n\n📖 시험 포인트:\n- 핀의 전단 응력 계산\n- 더블 시어(Double Shear)\n- 베어링 응력 분석" 
    },
  ],
};

/**
 * URL이 3D 모델 파일(.glb/.gltf)인지 확인
 */
const is3DModelFile = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const lowerUrl = url.toLowerCase();
  return lowerUrl.endsWith('.glb') || 
         lowerUrl.endsWith('.gltf') || 
         lowerUrl.includes('.glb?') || 
         lowerUrl.includes('.gltf?');
};

/**
 * API의 parts 데이터를 UI용 형태로 변환
 */
export const mapModelData = async (apiData) => {
  const { name, parts, assemblyModelUrl } = apiData;

  const folderName = name.replace(/\s+/g, "");
  const fileMap = FILE_MAP_BY_MODEL[name];

  const result = [];

  // 1. 완성본 추가 (GLB/GLTF 파일인 경우만)
  if (assemblyModelUrl && is3DModelFile(assemblyModelUrl)) {
    if (assemblyModelUrl.startsWith("http")) {
      result.push({
        id: "assembly",
        name: apiData.name ,
        description: apiData.description || "모든 부품이 조립된 완성 모델입니다.",
        model: assemblyModelUrl,
        meshName: "assembly",
        isAssembly: true,
      });
    } else {
      try {
        const signedUrl = await getAssemblyModelSignedUrl(assemblyModelUrl);
        if (signedUrl && is3DModelFile(signedUrl)) {
          result.push({
            id: "assembly",
            name: apiData.name ,
            description: apiData.description || "모든 부품이 조립된 완성 모델입니다.",
            model: signedUrl,
            meshName: "assembly",
            isAssembly: true,
          });
        }
      } catch (error) {
        console.error("❌ 완성본 URL 가져오기 실패:", error);
      }
    }
  } else if (assemblyModelUrl) {
    console.log(`ℹ️ 완성본이 이미지 파일입니다 (썸네일 용도): ${assemblyModelUrl}`);
  }

  // 2. parts 데이터 결정 (API 또는 하드코딩)
  let partsData = parts;
  
  if (!partsData || partsData.length === 0) {
    console.log(`⚠️ API에서 parts 데이터가 없습니다. 하드코딩된 데이터 사용 시도...`);
    partsData = HARDCODED_PARTS[name];
    
    if (!partsData) {
      console.warn(`❌ ${name} 모델의 하드코딩된 부품 정보도 없습니다.`);
      return result;
    }
    
    console.log(`✅ ${name} 하드코딩된 부품 ${partsData.length}개 사용`);
  }

  // 3. 파일 매핑이 없는 경우
  if (!fileMap) {
    console.log(`ℹ️ ${name} 모델의 파일 매핑이 없습니다.`);
    partsData.forEach((part, index) => {
      result.push({
        id: `part_${index + 1}`,
        name: part.name,
        description: part.description,
        model: null,
        meshName: part.meshName,
        partImageUrl: part.partImageUrl,
        isAssembly: false,
      });
    });
    return result;
  }

  // 4. 로컬 파일 경로 생성
  console.log(`✅ ${name} 모델의 로컬 파일 매핑 사용`);
  partsData.forEach((part, index) => {
    const fileName = fileMap[part.meshName];

    if (!fileName) {
      console.warn(`⚠️ 파일명 매핑 없음: ${part.meshName} (${name})`);
    }

    const encodedPath = fileName
      ? `/models/${folderName}/${encodeURIComponent(fileName)}`
      : null;

    result.push({
      id: `part_${index + 1}`,
      name: part.name,
      description: part.description,
      model: encodedPath,
      meshName: part.meshName,
      partImageUrl: part.partImageUrl,
      isAssembly: false,
    });
  });

  return result;
};

/**
 * 특정 모델에 새로운 파일 매핑 추가
 */
export const addFileMapping = (modelName, fileMap) => {
  FILE_MAP_BY_MODEL[modelName] = fileMap;
};