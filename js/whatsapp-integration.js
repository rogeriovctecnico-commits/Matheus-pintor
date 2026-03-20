/**
 * Classe para gerenciar integração com WhatsApp
 * Suporta tanto Click-to-Chat quanto API do WhatsApp Business
 */
class WhatsAppIntegration {
  constructor() {
    this.form = document.getElementById("whatsappForm");
    this.submitBtn = document.getElementById("submitBtn");
    this.formStatus = document.getElementById("formStatus");

    // Configurações
    this.config = {
      // Número do WhatsApp Business (seu número)
      businessPhone: "5511999999999", // Substitua pelo seu número

      // Configurações da API (se usar backend)
      apiEndpoint: "/api/whatsapp/send", // Endpoint do seu backend
      apiKey: "sua-api-key-aqui", // Sua chave da API

      // Configurações de validação
      validation: {
        phoneRegex: /^[\+]?[1-9][\d]{0,15}$/,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        nameMinLength: 2,
      },
    };

    this.init();
  }

  /**
   * Inicializa a integração
   */
  init() {
    this.bindEvents();
    this.setupValidation();
    this.setupCharCounter();
  }

  /**
   * Vincula eventos do formulário
   */
  bindEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.form.addEventListener("reset", () => this.handleReset());

    // Validação em tempo real
    const inputs = this.form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener("input", () => this.clearFieldError(input));
    });
  }

  /**
   * Configura validação de campos
   */
  setupValidation() {
    // Máscara para telefone
    const phoneInput = document.getElementById("telefone");
    phoneInput.addEventListener("input", (e) => this.formatPhone(e));

    // Validação de checkbox de termos
    const termosCheckbox = document.getElementById("aceitaTermos");
    termosCheckbox.addEventListener("change", () => this.validateTerms());
  }

  /**
   * Configura contador de caracteres
   */
  setupCharCounter() {
    const mensagemTextarea = document.getElementById("mensagem");
    const charCounter = document.querySelector(".char-counter");

    mensagemTextarea.addEventListener("input", () => {
      const currentLength = mensagemTextarea.value.length;
      const maxLength = mensagemTextarea.getAttribute("maxlength");
      charCounter.textContent = `${currentLength}/${maxLength} caracteres`;

      if (currentLength > maxLength * 0.9) {
        charCounter.style.color = "#e74c3c";
      } else {
        charCounter.style.color = "#666";
      }
    });
  }

  /**
   * Manipula submissão do formulário
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Validar formulário
    if (!this.validateForm()) {
      this.showStatus(
        "Por favor, corrija os erros antes de continuar.",
        "error",
      );
      return;
    }

    // Coletar dados
    const formData = this.collectFormData();

    // Mostrar loading
    this.setLoading(true);

    try {
      // Escolher método de envio
      const useAPI = false; // Mude para true se tiver backend com API

      if (useAPI) {
        await this.sendViaAPI(formData);
      } else {
        this.sendViaClickToChat(formData);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      this.showStatus("Erro ao enviar mensagem. Tente novamente.", "error");
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Coleta dados do formulário
   */
  collectFormData() {
    const formData = new FormData(this.form);
    const data = {};

    // Converter FormData para objeto
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Limpar e formatar telefone
    data.telefone = this.cleanPhone(data.telefone);

    // Adicionar timestamp
    data.timestamp = new Date().toISOString();
    data.timestampBR = new Date().toLocaleString("pt-BR");

    return data;
  }

  /**
   * Envia mensagem via Click-to-Chat (client-side)
   */
  sendViaClickToChat(data) {
    const message = this.formatMessage(data);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${data.telefone}?text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, "_blank");

    // Também enviar para o seu número (opcional)
    this.sendToBusinessNumber(data);

    this.showStatus(
      `Redirecionando para o WhatsApp... Verifique se uma nova aba foi aberta.`,
      "success",
    );

    // Limpar formulário após sucesso
    setTimeout(() => {
      this.form.reset();
      this.showStatus("Formulário enviado com sucesso!", "success");
    }, 2000);
  }

  /**
   * Envia notificação para o número do negócio
   */
  sendToBusinessNumber(data) {
    const businessMessage = this.formatBusinessMessage(data);
    const encodedBusinessMessage = encodeURIComponent(businessMessage);
    const businessUrl = `https://wa.me/${this.config.businessPhone}?text=${encodedBusinessMessage}`;

    // Abrir em nova aba após um delay
    setTimeout(() => {
      window.open(businessUrl, "_blank");
    }, 1000);
  }

  /**
   * Envia mensagem via API do WhatsApp Business (backend)
   */
  async sendViaAPI(data) {
    const response = await fetch(this.config.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        to: data.telefone,
        message: this.formatMessage(data),
        businessNotification: {
          to: this.config.businessPhone,
          message: this.formatBusinessMessage(data),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }

    const result = await response.json();

    this.showStatus("Mensagem enviada com sucesso!", "success");
    this.form.reset();

    return result;
  }

  /**
   * Formata mensagem para o cliente
   */
  formatMessage(data) {
    const servicoTexto = this.getServicoTexto(data.tipoServico);
    const horarioTexto = this.getHorarioTexto(data.horarioContato);

    let message = `🎨 *Olá ${data.nomeCompleto}!*\n\n`;
    message += `Obrigado por entrar em contato conosco!\n\n`;
    message += `📋 *Resumo do seu interesse:*\n`;
    message += `• *Serviço:* ${servicoTexto}\n`;

    if (data.endereco) {
      message += `• *Local:* ${data.endereco}\n`;
    }

    message += `• *Melhor horário:* ${horarioTexto}\n\n`;

    if (data.mensagem) {
      message += `💬 *Detalhes:* ${data.mensagem}\n\n`;
    }

    message += `✅ Em breve entraremos em contato para agendar uma visita e elaborar seu orçamento personalizado.\n\n`;
    message += `🏠 *Matheus Cunha - Pinturas e Reformas*\n`;
    message += `📱 Transformando ideias em realidade desde 2016`;

    return message;
  }

  /**
   * Formata mensagem para o negócio
   */
  formatBusinessMessage(data) {
    const servicoTexto = this.getServicoTexto(data.tipoServico);
    const horarioTexto = this.getHorarioTexto(data.horarioContato);

    let message = `🔔 *NOVO LEAD - FORMULÁRIO SITE*\n\n`;
    message += `👤 *Cliente:* ${data.nomeCompleto}\n`;
    message += `📱 *WhatsApp:* ${data.telefone}\n`;

    if (data.email) {
      message += `📧 *E-mail:* ${data.email}\n`;
    }

    message += `�� *Serviço:* ${servicoTexto}\n`;

    if (data.endereco) {
      message += `📍 *Local:* ${data.endereco}\n`;
    }

    message += `⏰ *Horário preferido:* ${horarioTexto}\n`;
    message += `📅 *Data:* ${data.timestampBR}\n\n`;

    if (data.mensagem) {
      message += `💬 *Detalhes do projeto:*\n${data.mensagem}\n\n`;
    }

    message += `🚀 *Ação necessária:* Entrar em contato para agendar visita`;

    return message;
  }

  /**
   * Converte código do serviço em texto
   */
  getServicoTexto(codigo) {
    const servicos = {
      "pintura-fachada": "Pintura de Fachada",
      "pintura-interna": "Pintura Interna",
      "reforma-completa": "Reforma Completa",
      consultoria: "Consultoria",
      outro: "Outro serviço",
    };
    return servicos[codigo] || "Não especificado";
  }

  /**
   * Converte código do horário em texto
   */
  getHorarioTexto(codigo) {
    const horarios = {
      manha: "Manhã (8h-12h)",
      tarde: "Tarde (13h-17h)",
      noite: "Noite (18h-20h)",
    };
    return horarios[codigo] || "Não especificado";
  }

  /**
   * Valida todo o formulário
   */
  validateForm() {
    let isValid = true;

    // Validar campos obrigatórios
    const requiredFields = ["nomeCompleto", "telefone", "tipoServico"];

    requiredFields.forEach((fieldName) => {
      const field = document.getElementById(fieldName);
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    // Validar termos
    if (!this.validateTerms()) {
      isValid = false;
    }

    return isValid;
  }

  /**
   * Valida campo individual
   */
  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = "";

    // Validações específicas por campo
    switch (fieldName) {
      case "nomeCompleto":
        if (!value) {
          errorMessage = "Nome é obrigatório";
          isValid = false;
        } else if (value.length < this.config.validation.nameMinLength) {
          errorMessage = `Nome deve ter pelo menos ${this.config.validation.nameMinLength} caracteres`;
          isValid = false;
        }
        break;

      case "telefone":
        if (!value) {
          errorMessage = "Telefone é obrigatório";
          isValid = false;
        } else {
          const cleanPhone = this.cleanPhone(value);
          if (!this.config.validation.phoneRegex.test(cleanPhone)) {
            errorMessage = "Formato de telefone inválido";
            isValid = false;
          } else if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            errorMessage = "Telefone deve ter entre 10 e 15 dígitos";
            isValid = false;
          }
        }
        break;

      case "email":
        if (value && !this.config.validation.emailRegex.test(value)) {
          errorMessage = "E-mail inválido";
          isValid = false;
        }
        break;

      case "tipoServico":
        if (!value) {
          errorMessage = "Selecione um tipo de serviço";
          isValid = false;
        }
        break;
    }

    // Mostrar/esconder erro
    this.showFieldError(field, errorMessage);

    return isValid;
  }

  /**
   * Valida checkbox de termos
   */
  validateTerms() {
    const checkbox = document.getElementById("aceitaTermos");
    const isValid = checkbox.checked;

    if (!isValid) {
      this.showFieldError(
        checkbox,
        "Você deve aceitar os termos para continuar",
      );
    } else {
      this.clearFieldError(checkbox);
    }

    return isValid;
  }

  /**
   * Mostra erro em campo específico
   */
  showFieldError(field, message) {
    const errorElement =
      document.getElementById(field.name + "Error") ||
      document.getElementById(field.id + "Error");

    if (errorElement) {
      errorElement.textContent = message;
      field.classList.toggle("error", !!message);
    }
  }

  /**
   * Limpa erro de campo específico
   */
  clearFieldError(field) {
    this.showFieldError(field, "");
  }

  /**
   * Formata telefone com máscara
   */
  formatPhone(e) {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 11) {
      // Formato brasileiro: (11) 99999-9999
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
      value = value.replace(/^(\d*)/, "($1");
    }

    e.target.value = value;
  }

  /**
   * Limpa formatação do telefone
   */
  cleanPhone(phone) {
    return phone.replace(/\D/g, "");
  }

  /**
   * Manipula reset do formulário
   */
  handleReset() {
    // Limpar erros
    const errorElements = this.form.querySelectorAll(".error-message");
    errorElements.forEach((el) => (el.textContent = ""));

    const errorFields = this.form.querySelectorAll(".error");
    errorFields.forEach((field) => field.classList.remove("error"));

    // Limpar status
    this.formStatus.style.display = "none";

    // Reset contador de caracteres
    const charCounter = document.querySelector(".char-counter");
    if (charCounter) {
      charCounter.textContent = "0/500 caracteres";
      charCounter.style.color = "#666";
    }
  }

  /**
   * Define estado de loading
   */
  setLoading(isLoading) {
    this.submitBtn.disabled = isLoading;

    if (isLoading) {
      this.submitBtn.innerHTML = `
                <div class="loading-spinner"></div>
                Enviando...
            `;
      this.showStatus("Preparando mensagem...", "loading");
    } else {
      this.submitBtn.innerHTML = `
                <i class="fab fa-whatsapp"></i>
                Enviar via WhatsApp
            `;
    }
  }

  /**
   * Mostra status do formulário
   */
  showStatus(message, type) {
    this.formStatus.textContent = message;
    this.formStatus.className = `form-status ${type}`;
    this.formStatus.style.display = "block";

    // Auto-hide após 5 segundos para mensagens de sucesso
    if (type === "success") {
      setTimeout(() => {
        this.formStatus.style.display = "none";
      }, 5000);
    }
  }
}

/**
 * Exemplo de implementação backend para API do WhatsApp Business
 * (Node.js + Express + WhatsApp Business API)
 */
class WhatsAppAPIExample {
  /**
   * Exemplo de endpoint backend (Node.js)
   */
  static getBackendExample() {
    return `
// backend/routes/whatsapp.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Configurações da API do WhatsApp Business
const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

router.post('/send', async (req, res) => {
    try {
        const { to, message, businessNotification } = req.body;
        
        // Enviar mensagem para o cliente
        const clientResponse = await axios.post(WHATSAPP_API_URL, {
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: {
                body: message
            }
        }, {
            headers: {
                'Authorization': \`Bearer \${ACCESS_TOKEN}\`,
                'Content-Type': 'application/json'
            }
        });
        
        // Enviar notificação para o negócio
        if (businessNotification) {
            await axios.post(WHATSAPP_API_URL, {
                messaging_product: 'whatsapp',
                to: businessNotification.to,
                type: 'text',
                text: {
                    body: businessNotification.message
                }
            }, {
                headers: {
                    'Authorization': \`Bearer \${ACCESS_TOKEN}\`,
                    'Content-Type': 'application/json'
                }
            });
        }
        
        res.json({
            success: true,
            messageId: clientResponse.data.messages[0].id
        });
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
        `;
  }
}

/**
 * Inicialização quando o DOM estiver carregado
 */
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar integração WhatsApp
  new WhatsAppIntegration();

  console.log("Integração WhatsApp inicializada com sucesso!");
});

/**
 * Exportar classes para uso em outros módulos (se necessário)
 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { WhatsAppIntegration, WhatsAppAPIExample };
}
