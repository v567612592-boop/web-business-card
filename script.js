/**
 * ==========================================================================
 * 웹 명함 및 이력서 상호작용 스크립트 (script.js)
 * ==========================================================================
 */

// 1. 명함 3D 뒤집기 제어 (Flip Card)
function flipCard() {
  const card = document.getElementById('business-card');
  const cardInner = card.querySelector('.card-inner');
  card.classList.toggle('flipped');
  
  // 뒤집힐 때 마우스 틸트 효과 초기화 (클릭 시 튀는 현상 방지)
  const isFlipped = card.classList.contains('flipped');
  cardInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
}

// 2. 텍스트 클립보드 복사 함수 (이메일, 연락처 등)
function copyText(text, successMessage, event) {
  // 이벤트 전파 방지 (클릭 시 명함이 뒤집히는 것 방지)
  if (event) {
    event.stopPropagation();
  }
  
  // 클립보드 복사 API 실행
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMessage);
  }).catch(err => {
    console.error('복사 실패:', err);
    // 구형 브라우저 대응을 위한 대체 방법
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(successMessage);
    } catch (e) {
      showToast('복사에 실패했습니다. 직접 복사해주세요.');
    }
    document.body.removeChild(textarea);
  });
}

// 3. 토스트 알림 팝업 제어
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  toastMessage.textContent = message;
  toast.classList.add('show');
  
  // 이전 타이머 해제 후 새로 설정 (중복 클릭 시 팝업 유지 처리)
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// 4. 특정 섹션으로 부드러운 스크롤 이동
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// 5. 연락처 파일(.vcf) 동적 다운로드 기능
function downloadVCard(event) {
  // 이벤트 전파 방지 (명함 뒤집힘 방지)
  if (event) {
    event.stopPropagation();
  }

  // 연락처 정보를 vCard 3.0 포맷으로 작성
  // UTF-8 인코딩을 지정하여 한글 깨짐을 방지합니다.
  const vCardText = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'REV:' + new Date().toISOString(),
    'N;CHARSET=UTF-8:김;지혜;;;',
    'FN;CHARSET=UTF-8:김지혜',
    'ORG;CHARSET=UTF-8:사무 행정 / AI 사무 자동화',
    'TITLE;CHARSET=UTF-8:Office & Admin Specialist',
    'TEL;TYPE=CELL:010-4184-6404',
    'EMAIL;TYPE=PREF,INTERNET:j_hye03@naver.com',
    'END:VCARD'
  ].join('\r\n');

  // Blob 객체를 생성하여 다운로드 처리
  const blob = new Blob([vCardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '김지혜_연락처.vcf';
  
  document.body.appendChild(link);
  link.click();
  
  // 메모리 해제
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);

  showToast('연락처 파일(.vcf)이 휴대폰에 저장되었습니다!');
}

// 6. 모바일 웹 공유 API 연동 및 클립보드 복사
function shareCard(event) {
  // 이벤트 전파 방지 (명함 뒤집힘 방지)
  if (event) {
    event.stopPropagation();
  }

  const currentUrl = window.location.href;

  // 모바일 브라우저의 공유창 기능 사용 가능한지 확인
  if (navigator.share) {
    navigator.share({
      title: '김지혜의 디지털 웹 명함',
      text: '안녕하세요! 김지혜의 웹 명함과 이력서입니다.',
      url: currentUrl
    })
    .then(() => console.log('공유 성공'))
    .catch((error) => console.log('공유 취소 또는 오류:', error));
  } else {
    // 일반 PC 브라우저 등에서 미지원 시 클립보드에 주소 복사 대체
    navigator.clipboard.writeText(currentUrl).then(() => {
      showToast('웹 명함 주소가 복사되었습니다! 카톡 등에 붙여넣어 공유하세요.');
    }).catch(err => {
      showToast('주소 복사에 실패했습니다. 상단 주소창을 복사해 주세요.');
    });
  }
}

// 7. 이력서 화면 등장 시 애니메이션 및 명함 3D 틸트 효과 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 이력서 애니메이션 (전체 페이드인 + 카드 스태거 등장)
  const resumeSection = document.getElementById('resume-section');
  if (resumeSection) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          resumeSection.classList.add('active');
          
          // 개별 카드 순차 등장 (stagger)
          const cards = resumeSection.querySelectorAll('.resume-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('visible');
            }, 150 * index);
          });
        }
      });
    }, {
      threshold: 0.05
    });
    
    sectionObserver.observe(resumeSection);
  }

  // 3D 카드 틸트 및 홀로그램 빛 반사 효과 제어
  const card = document.getElementById('business-card');
  if (card) {
    const cardInner = card.querySelector('.card-inner');
    const frontGlow = card.querySelector('.card-front .card-glass-glow');
    const backGlow = card.querySelector('.card-back .card-glass-glow');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;

      // 마우스 위치에 따른 각도 계산 (-12도 ~ 12도 범위로 제한)
      const rotateY = ((x - w / 2) / (w / 2)) * 12;
      const rotateX = -((y - h / 2) / (h / 2)) * 12;

      const isFlipped = card.classList.contains('flipped');
      const baseRotationY = isFlipped ? 180 : 0;
      
      // 뒤집혔을 때는 Y축 틸트 연산을 반전 처리하여 자연스러운 움직임 유도
      const tiltX = rotateX;
      const tiltY = isFlipped ? -rotateY : rotateY;

      // 3D transform 적용
      cardInner.style.transform = `rotateX(${tiltX}deg) rotateY(${baseRotationY + tiltY}deg)`;

      // 홀로그램 빛 반사 효과 (radial-gradient의 위치를 마우스 위치로 동적 맵핑)
      const px = (x / w) * 100;
      const py = (y / h) * 100;

      if (!isFlipped && frontGlow) {
        frontGlow.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)`;
      } else if (isFlipped && backGlow) {
        backGlow.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)`;
      }
    });

    // 마우스가 카드를 나갔을 때 상태 원복
    card.addEventListener('mouseleave', () => {
      const isFlipped = card.classList.contains('flipped');
      cardInner.style.transform = isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
      
      if (frontGlow) frontGlow.style.background = '';
      if (backGlow) backGlow.style.background = '';
    });
  }
});
