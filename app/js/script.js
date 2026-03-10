/**
 * Classe para gerenciar o portfólio de projetos
 * Organiza as imagens por projeto e cria layout horizontal responsivo
 */
class PortfolioManager {
  constructor() {
    this.projectsContainer = document.querySelector(".projects-container");

    // Dados dos projetos organizados por categoria
    this.projetos = [
      {
        id: "santa-efigenia",
        titulo: "Reforma Completa - Santa Efigênia",
        descricao:
          "Transformação completa de fachada residencial no bairro Santa Efigênia, Belo Horizonte. Projeto incluiu preparação da superfície, aplicação de tinta acrílica premium e acabamentos especiais.",
        imagens: [
          {
            src: "img/santaefigenicaAntes.jpeg",
            alt: "Estado inicial da fachada - Santa Efigênia",
            titulo: "Antes da Reforma",
            descricao: "Estado inicial da fachada",
          },
          {
            src: "img/santaefigeniarealizando.jpeg",
            alt: "Processo de pintura em andamento - Santa Efigênia",
            titulo: "Durante o Processo",
            descricao: "Aplicação da tinta em andamento",
          },
          {
            src: "img/santaefigenica-bh-depois.jpeg",
            alt: "Resultado final da pintura - Santa Efigênia",
            titulo: "Resultado Final",
            descricao: "Fachada completamente renovada",
          },
          {
            src: "img/santaefigenica-bh-depoisB.jpeg",
            alt: "Vista lateral da fachada renovada - Santa Efigênia",
            titulo: "Vista Lateral",
            descricao: "Detalhes do acabamento lateral",
          },
        ],
      },
      // Exemplo de como adicionar mais projetos
      {
        id: "projeto-centro",
        titulo: "Pintura Comercial - Centro BH",
        descricao:
          "Renovação de fachada comercial no centro de Belo Horizonte com foco em durabilidade e resistência ao clima urbano.",
        imagens: [
          // Adicione as imagens deste projeto aqui
          // {
          //     src: 'img/centro-antes.jpeg',
          //     alt: 'Fachada comercial antes da reforma',
          //     titulo: 'Estado Inicial',
          //     descricao: 'Fachada necessitando renovação'
          // }
        ],
      },
    ];

    this.init();
  }

  /**
   * Inicializa o portfólio
   */
  init() {
    this.renderProjects();
    this.addEventListeners();
    this.setupLazyLoading();
  }

  /**
   * Renderiza todos os projetos na página
   */
  renderProjects() {
    // Limpa o container antes de renderizar
    this.projectsContainer.innerHTML = "";

    this.projetos.forEach((projeto) => {
      // Só renderiza projetos que têm imagens
      if (projeto.imagens && projeto.imagens.length > 0) {
        const projectElement = this.createProjectElement(projeto);
        this.projectsContainer.appendChild(projectElement);
      }
    });
  }

  /**
   * Cria o elemento HTML para um projeto
   * @param {Object} projeto - Dados do projeto
   * @returns {HTMLElement} - Elemento do projeto
   */
  createProjectElement(projeto) {
    const projectDiv = document.createElement("div");
    projectDiv.classList.add("project");
    projectDiv.setAttribute("data-project-id", projeto.id);

    // Cabeçalho do projeto
    const projectHeader = document.createElement("div");
    projectHeader.classList.add("project-header");

    const projectTitle = document.createElement("h3");
    projectTitle.classList.add("project-title");
    projectTitle.textContent = projeto.titulo;

    const projectDescription = document.createElement("p");
    projectDescription.classList.add("project-description");
    projectDescription.textContent = projeto.descricao;

    projectHeader.appendChild(projectTitle);
    projectHeader.appendChild(projectDescription);

    // Container das imagens
    const imagesContainer = document.createElement("div");
    imagesContainer.classList.add("project-images");

    // Adiciona cada imagem
    projeto.imagens.forEach((imagem, index) => {
      const imageElement = this.createImageElement(imagem, projeto.id, index);
      imagesContainer.appendChild(imageElement);
    });

    // Monta o projeto completo
    projectDiv.appendChild(projectHeader);
    projectDiv.appendChild(imagesContainer);

    return projectDiv;
  }

  /**
   * Cria o elemento HTML para uma imagem
   * @param {Object} imagem - Dados da imagem
   * @param {string} projectId - ID do projeto
   * @param {number} index - Índice da imagem
   * @returns {HTMLElement} - Elemento da imagem
   */
  createImageElement(imagem, projectId, index) {
    const imageDiv = document.createElement("div");
    imageDiv.classList.add("project-image");
    imageDiv.setAttribute("data-project", projectId);
    imageDiv.setAttribute("data-index", index);

    // Imagem principal
    const img = document.createElement("img");
    img.setAttribute("data-src", imagem.src); // Para lazy loading
    img.alt = imagem.alt;
    img.loading = "lazy"; // Lazy loading nativo do browser

    // Overlay com informações
    const overlay = document.createElement("div");
    overlay.classList.add("image-overlay");

    const overlayTitle = document.createElement("h4");
    overlayTitle.textContent = imagem.titulo;

    const overlayDescription = document.createElement("p");
    overlayDescription.textContent = imagem.descricao;

    overlay.appendChild(overlayTitle);
    overlay.appendChild(overlayDescription);

    // Monta o elemento da imagem
    imageDiv.appendChild(img);
    imageDiv.appendChild(overlay);

    return imageDiv;
  }

  /**
   * Adiciona event listeners para interações
   */
  addEventListeners() {
    // Click nas imagens para possível modal futuro
    this.projectsContainer.addEventListener("click", (e) => {
      const imageElement = e.target.closest(".project-image");
      if (imageElement) {
        this.handleImageClick(imageElement);
      }
    });

    // Navegação por teclado nas galerias
    this.projectsContainer.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        this.handleKeyboardNavigation(e);
      }
    });
  }

  /**
   * Configura lazy loading para as imagens
   */
  setupLazyLoading() {
    // Intersection Observer para lazy loading
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute("data-src");

            if (src) {
              img.src = src;
              img.removeAttribute("data-src");
              img.classList.add("loaded");
              imageObserver.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: "50px", // Carrega imagens 50px antes de aparecerem
      },
    );

    // Observa todas as imagens
    const images = this.projectsContainer.querySelectorAll("img[data-src]");
    images.forEach((img) => imageObserver.observe(img));
  }

  /**
   * Manipula cliques nas imagens
   * @param {HTMLElement} imageElement - Elemento da imagem clicada
   */
  handleImageClick(imageElement) {
    const projectId = imageElement.getAttribute("data-project");
    const imageIndex = imageElement.getAttribute("data-index");

    console.log(`Imagem clicada: Projeto ${projectId}, Imagem ${imageIndex}`);

    // Aqui você pode implementar um modal ou lightbox
    // Por exemplo: this.openImageModal(projectId, imageIndex);
  }

  /**
   * Manipula navegação por teclado
   * @param {KeyboardEvent} e - Evento do teclado
   */
  handleKeyboardNavigation(e) {
    const focusedElement = document.activeElement;
    const projectImages = focusedElement.closest(".project-images");

    if (projectImages) {
      const images = projectImages.querySelectorAll(".project-image");
      const currentIndex = Array.from(images).indexOf(focusedElement);

      let nextIndex;
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        nextIndex = currentIndex + 1;
      }

      if (nextIndex !== undefined) {
        images[nextIndex].focus();
        e.preventDefault();
      }
    }
  }

  /**
   * Método para adicionar novos projetos dinamicamente
   * @param {Object} novoProjeto - Dados do novo projeto
   */
  adicionarProjeto(novoProjeto) {
    this.projetos.push(novoProjeto);
    this.renderProjects();
    this.setupLazyLoading();
  }

  /**
   * Método para filtrar projetos por categoria (futuro)
   * @param {string} categoria - Categoria para filtrar
   */
  filtrarPorCategoria(categoria) {
    // Implementação futura para filtros
    console.log(`Filtrar por categoria: ${categoria}`);
  }
}

/**
 * Utilitários para smooth scroll e navegação
 */
class NavigationUtils {
  static init() {
    this.setupSmoothScroll();
    this.setupActiveNavigation();
  }

  /**
   * Configura scroll suave para links de navegação
   */
  static setupSmoothScroll() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          const headerHeight = document.querySelector("header").offsetHeight;
          const targetPosition = targetSection.offsetTop - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }

  /**
   * Destaca o link de navegação ativo
   */
  static setupActiveNavigation() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    window.addEventListener("scroll", () => {
      let current = "";
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (
          scrollPosition >= sectionTop &&
          scrollPosition < sectionTop + sectionHeight
        ) {
          current = section.getAttribute("id");
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
          link.classList.add("active");
        }
      });
    });
  }
}

/**
 * Inicialização quando o DOM estiver carregado
 */
document.addEventListener("DOMContentLoaded", () => {
  // Inicializa o gerenciador de portfólio
  const portfolio = new PortfolioManager();

  // Inicializa utilitários de navegação
  NavigationUtils.init();

  // Log para debug
  console.log("Portfólio do Matheus Cunha carregado com sucesso!");
});

/**
 * Exporta as classes para uso em outros módulos (se necessário)
 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PortfolioManager, NavigationUtils };
}
/**
 * Classe para gerenciar o modal de imagens (Lightbox)
 */
class ImageModal {
  constructor() {
    this.modal = null;
    this.modalImage = null;
    this.modalTitle = null;
    this.modalDescription = null;
    this.currentImageSpan = null;
    this.totalImagesSpan = null;
    this.modalThumbnails = null;
    this.modalLoading = null;

    this.currentGalleryItem = null;
    this.currentImageIndex = 0;
    this.images = [];

    this.init();
  }

  /**
   * Inicializa o modal
   */
  init() {
    this.createModalElements();
    this.bindEvents();
    this.bindGalleryEvents();
  }

  /**
   * Cria os elementos do modal se não existirem
   */
  createModalElements() {
    this.modal = document.getElementById("imageModal");
    this.modalImage = document.getElementById("modalImage");
    this.modalTitle = document.getElementById("modalTitle");
    this.modalDescription = document.getElementById("modalDescription");
    this.currentImageSpan = document.getElementById("currentImage");
    this.totalImagesSpan = document.getElementById("totalImages");
    this.modalThumbnails = document.querySelector(".modal-thumbnails");
    this.modalLoading = document.querySelector(".modal-loading");
  }

  /**
   * Vincula eventos do modal
   */
  bindEvents() {
    // Fechar modal
    const closeBtn = document.querySelector(".modal-close");
    const overlay = document.querySelector(".modal-overlay");

    closeBtn?.addEventListener("click", () => this.closeModal());
    overlay?.addEventListener("click", () => this.closeModal());

    // Navegação
    const prevBtn = document.querySelector(".modal-prev");
    const nextBtn = document.querySelector(".modal-next");

    prevBtn?.addEventListener("click", () => this.previousImage());
    nextBtn?.addEventListener("click", () => this.nextImage());

    // Teclado
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));

    // Carregamento da imagem
    this.modalImage?.addEventListener("load", () => this.onImageLoad());
    this.modalImage?.addEventListener("error", () => this.onImageError());
  }

  /**
   * Vincula eventos das galerias
   */
  bindGalleryEvents() {
    const galleryItems = document.querySelectorAll(".gallery-item");

    galleryItems.forEach((item) => {
      const images = item.querySelectorAll("img");

      images.forEach((img, index) => {
        img.addEventListener("click", (e) => {
          e.preventDefault();
          this.openModal(item, index);
        });

        // Adicionar cursor pointer e efeito visual
        img.style.cursor = "pointer";
        img.title = "Clique para ampliar";
      });
    });
  }

  /**
   * Abre o modal com uma imagem específica
   */
  openModal(galleryItem, imageIndex = 0) {
    this.currentGalleryItem = galleryItem;
    this.currentImageIndex = imageIndex;

    // Coletar todas as imagens do item
    this.images = Array.from(galleryItem.querySelectorAll("img")).map(
      (img) => ({
        src: img.src,
        alt: img.alt,
        title: this.extractImageTitle(img.alt),
        description: this.extractImageDescription(img.alt),
      }),
    );

    // Atualizar informações
    this.updateModalInfo();
    this.createThumbnails();
    this.loadImage(this.currentImageIndex);

    // Mostrar modal
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Foco para acessibilidade
    this.modal.focus();
  }

  /**
   * Fecha o modal
   */
  closeModal() {
    this.modal.classList.remove("active");
    document.body.style.overflow = "";

    // Limpar imagem
    this.modalImage.src = "";
    this.modalImage.classList.remove("loaded");
  }

  /**
   * Carrega uma imagem específica
   */
  loadImage(index) {
    if (index < 0 || index >= this.images.length) return;

    this.currentImageIndex = index;

    // Mostrar loading
    this.showLoading();

    // Remover classe loaded
    this.modalImage.classList.remove("loaded");

    // Carregar nova imagem
    this.modalImage.src = this.images[index].src;
    this.modalImage.alt = this.images[index].alt;

    // Atualizar informações
    this.updateModalInfo();
    this.updateThumbnails();
    this.updateNavigationButtons();
  }

  /**
   * Navega para a imagem anterior
   */
  previousImage() {
    if (this.currentImageIndex > 0) {
      this.loadImage(this.currentImageIndex - 1);
    }
  }

  /**
   * Navega para a próxima imagem
   */
  nextImage() {
    if (this.currentImageIndex < this.images.length - 1) {
      this.loadImage(this.currentImageIndex + 1);
    }
  }

  /**
   * Manipula eventos do teclado
   */
  handleKeyboard(e) {
    if (!this.modal.classList.contains("active")) return;

    switch (e.key) {
      case "Escape":
        this.closeModal();
        break;
      case "ArrowLeft":
        this.previousImage();
        break;
      case "ArrowRight":
        this.nextImage();
        break;
    }
  }

  /**
   * Evento quando a imagem carrega
   */
  onImageLoad() {
    this.hideLoading();
    this.modalImage.classList.add("loaded");
  }

  /**
   * Evento quando há erro no carregamento
   */
  onImageError() {
    this.hideLoading();
    console.error("Erro ao carregar imagem:", this.modalImage.src);
  }

  /**
   * Mostra indicador de carregamento
   */
  showLoading() {
    this.modalLoading?.classList.add("active");
  }

  /**
   * Esconde indicador de carregamento
   */
  hideLoading() {
    this.modalLoading?.classList.remove("active");
  }

  /**
   * Atualiza informações do modal
   */
  updateModalInfo() {
    const currentImage = this.images[this.currentImageIndex];

    if (this.modalTitle) {
      this.modalTitle.textContent = currentImage.title;
    }

    if (this.modalDescription) {
      this.modalDescription.textContent = currentImage.description;
    }

    if (this.currentImageSpan) {
      this.currentImageSpan.textContent = this.currentImageIndex + 1;
    }

    if (this.totalImagesSpan) {
      this.totalImagesSpan.textContent = this.images.length;
    }
  }

  /**
   * Cria thumbnails para navegação rápida
   */
  createThumbnails() {
    if (!this.modalThumbnails) return;

    this.modalThumbnails.innerHTML = "";

    this.images.forEach((image, index) => {
      const thumbnail = document.createElement("img");
      thumbnail.src = image.src;
      thumbnail.alt = image.alt;
      thumbnail.className = "modal-thumbnail";
      thumbnail.addEventListener("click", () => this.loadImage(index));

      this.modalThumbnails.appendChild(thumbnail);
    });
  }

  /**
   * Atualiza estado dos thumbnails
   */
  updateThumbnails() {
    const thumbnails =
      this.modalThumbnails?.querySelectorAll(".modal-thumbnail");

    thumbnails?.forEach((thumb, index) => {
      thumb.classList.toggle("active", index === this.currentImageIndex);
    });
  }

  /**
   * Atualiza botões de navegação
   */
  updateNavigationButtons() {
    const prevBtn = document.querySelector(".modal-prev");
    const nextBtn = document.querySelector(".modal-next");

    if (prevBtn) {
      prevBtn.disabled = this.currentImageIndex === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentImageIndex === this.images.length - 1;
    }
  }

  /**
   * Extrai título da imagem do alt text
   */
  extractImageTitle(altText) {
    // Extrair título do alt text (ex: "Pintura de fachada - Antes" -> "Antes")
    const parts = altText.split(" - ");
    return parts.length > 1 ? parts[parts.length - 1] : "Imagem do Projeto";
  }

  /**
   * Extrai descrição da imagem do alt text
   */
  extractImageDescription(altText) {
    // Extrair descrição do alt text
    const parts = altText.split(" - ");
    return parts.length > 1 ? parts[0] : altText;
  }
}

/**
 * Inicialização quando o DOM estiver carregado
 */
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar modal de imagens
  new ImageModal();

  console.log("Modal de imagens inicializado com sucesso!");
});
