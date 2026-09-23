const BOT_TOKEN = '8751335932:AAHoS96avp1R_OsG0uI9yk1aie02H7Lb2Ms';
const CHAT_ID = '2056358288';

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close-btn');
    const orderForm = document.getElementById('orderForm');
    const modalPackageDetails = document.getElementById('modalPackageDetails');
    const orderStatus = document.getElementById('orderStatus');
    const btnConfirmOrder = document.getElementById('btnConfirmOrder');
    
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

    // Handle form submission
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
            alert('Veuillez configurer votre BOT_TOKEN et CHAT_ID dans le fichier script.js');
            return;
        }

        btnConfirmOrder.disabled = true;
        btnConfirmOrder.textContent = 'ENVOI EN COURS...';
        orderStatus.style.display = 'none';

        const message = `🔔 *NOUVELLE COMMANDE*\n\n` +
                        `📦 *Forfait*: ${selectedPackage}\n` +
                        `💰 *Prix*: ${selectedPrice}\n` +
                        `📞 *Numéro*: ${phoneNumber}\n` +
                        `⏱ *Date*: ${new Date().toLocaleString()}`;

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

            if (response.ok) {
                orderStatus.textContent = 'Commande envoyée avec succès !';
                orderStatus.className = 'order-status status-success';
                orderStatus.style.display = 'block';
                btnConfirmOrder.textContent = 'COMMANDE TERMINÉE';
                
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 3000);
            } else {
                throw new Error('Erreur API Telegram');
            }
        } catch (error) {
            console.error(error);
            orderStatus.textContent = 'Erreur lors de l\'envoi de la commande. Veuillez réessayer.';
            orderStatus.className = 'order-status status-error';
            orderStatus.style.display = 'block';
            btnConfirmOrder.disabled = false;
            btnConfirmOrder.textContent = 'CONFIRMER LA COMMANDE';
        }
    });
});
