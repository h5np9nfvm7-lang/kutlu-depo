// js/main.js - Temel JavaScript işlevselliği

// Sayfa kaydığında header'ın rengini değiştirme
window.addEventListener('scroll', function() {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Mobil menü toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('active');
    
    // Hamburger ikonunu döndürme
    const spans = this.querySelectorAll('span');
    if (this.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Badge hover efektleri
document.querySelectorAll('.badge').forEach(badge => {
  badge.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-2px)';
  });
  badge.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0)';
  });
});