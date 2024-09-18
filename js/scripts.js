// Importando a biblioteca PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];

if (!pdfjsLib || !pdfjsLib.getDocument) {
    console.error("A biblioteca PDF.js não foi carregada corretamente.");
} else {
    // URL do PDF
    const url = 'libs/edital.pdf';

    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    const scale = 1.16;  // Escala de zoom
    const canvas1 = document.getElementById('pdf-render1');
    const canvas2 = document.getElementById('pdf-render2');
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    // Função para renderizar uma página
    function renderPage(num, canvas, ctx) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(function() {
                pageRendering = false;
                if (pageNumPending !== null) {
                    renderPage(pageNumPending, canvas, ctx);
                    pageNumPending = null;
                }
            }).catch(function(error) {
                console.error("Erro ao renderizar a página: ", error);
            });
        }).catch(function(error) {
            console.error("Erro ao carregar a página: ", error);
        });
    }

    // Função para mudar as páginas
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            // Verifica se há páginas para renderizar
            if (num <= pdfDoc.numPages) {
                renderPage(num, canvas1, ctx1);
                if (num + 1 <= pdfDoc.numPages) {
                    renderPage(num + 1, canvas2, ctx2);
                } else {
                    // Limpa o canvas 2 se não houver segunda página para exibir
                    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                }
            }

            // Atualiza o texto do número da página
            let pageText = ` ${num}`;
            if (num + 1 <= pdfDoc.numPages) {
                pageText += ` e ${num + 1}`;
            }
            document.getElementById('page-num').textContent = pageText;
        }
    }

    // Função para mostrar a próxima dupla de páginas
    function nextPage() {
        if (pageNum + 2 <= pdfDoc.numPages) {
            pageNum += 2;
        } else {
            pageNum = 1;
        }
        queueRenderPage(pageNum);
    }

    // Carregar o PDF
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        queueRenderPage(pageNum);

        // Trocar de páginas a cada 10 segundos, se houver mais de uma página
        if (pdfDoc.numPages > 1) {
            setInterval(nextPage, 10000);
        }
    }).catch(function(error) {
        console.error("Erro ao carregar o PDF: ", error);
        alert("Não foi possível carregar o PDF. Verifique o console para mais detalhes.");
    });

    // Atualizar hora
    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const timeElement = document.getElementById('time');
        if (timeElement) {
            timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        } else {
            console.error("Elemento com ID 'time' não encontrado.");
        }
    }

    setInterval(updateTime, 1200);
    updateTime();
}