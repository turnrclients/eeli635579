$(document).ready(function () {
//  =========================================================
//for Alert modal
function injectCustomAlertCSS() {
    if (document.getElementById('custom-alert-style')) return;

    const style = document.createElement('style');
    style.id = 'custom-alert-style';
    style.innerHTML = `
        .modal.custom-alert-modal {
            z-index: 99998;
            font-family: 'Quicksand', sans-serif;
        }

        .modal-backdrop.custom-alert-backdrop,
        .modal-backdrop.custom-alert-backdrop.in,
        .modal-backdrop.custom-alert-backdrop.show {
            background-color: #000;
            opacity: 0.6;
        }

        .custom-alert-modal .modal-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -60%);
            opacity: 0;
            width: 100%;
            max-width: 420px;
            margin: 0;
            transition: transform 0.35s ease, opacity 0.35s ease;
        }

        .custom-alert-modal.in .modal-dialog,
        .custom-alert-modal.show .modal-dialog {
            transform: translate(-50%, -50%);
            opacity: 1;
        }

        .custom-alert-modal .modal-content {
            border-radius: 14px;
            border: none;
            box-shadow: 0 25px 60px rgba(0,0,0,0.35);
        }

        .custom-alert-modal .modal-body {
            padding: 30px 26px;
            text-align: center;
        }

        .custom-alert-modal .alert-message {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 22px;
        }

        .custom-alert-modal.success .alert-message {
            color: #28a745;
        }

        .custom-alert-modal.error .alert-message {
            color: #dc3545;
        }

        .custom-alert-modal .alert-ok-btn {
            background: linear-gradient(135deg, #e39a4e, #fb1b1b);
            color: #fff !important;
            border: none;
            padding: 10px 36px;
            border-radius: 230px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            transition: opacity 0.3s;
        }

        .custom-alert-modal .alert-ok-btn:hover {
            opacity: 0.9;
        }
    `;

    document.head.appendChild(style);
}

function showCustomAlertBox(type = 'error', message = 'Something went wrong') {

    injectCustomAlertCSS(); // 🔥 ensures CSS exists

    $('#customAlertModal').remove();

    const modalHtml = `
        <div class="modal fade custom-alert-modal ${type}"
             id="customAlertModal"
             tabindex="-1"
             role="dialog"
             aria-hidden="true">

            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-body">
                        <div class="alert-message">${message}</div>
                        <button type="button"
                                class="alert-ok-btn"
                                id="customAlertOkBtn"
                                data-dismiss="modal"
                                data-bs-dismiss="modal">
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $('body').append(modalHtml);

    const modalEl = document.getElementById('customAlertModal');

    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        modalEl.addEventListener('shown.bs.modal', () => {
            document.querySelector('.modal-backdrop')
                ?.classList.add('custom-alert-backdrop');
        });
    } else if ($.fn.modal) {
        $('#customAlertModal').modal('show');
        $('.modal-backdrop').addClass('custom-alert-backdrop');
    }
}

// OK button handler
$(document).on('click', '#customAlertOkBtn', function () {
    $('#customAlertModal').modal('hide');
});
$(document).on('hidden.bs.modal', '#customAlertModal', function () {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
});
//  =========================================================



    // Initialization
    var wrapper = $('#wrapper').addClass('editableSection');

    // Add top bar
    var topBar = $('<div>', { id: 'top-bar', class: 'top-bar' }).insertBefore(wrapper);

    // Add image upload form
    $('<form method="post" id="imgForm" enctype="multipart/form-data">').appendTo('body');
    $('<input type="file" name="imgFile" id="image-upload" class="hidden" accept="image/*">').appendTo('#imgForm');
    $('<input type="text" class="hidden formFieldFileName" name="imgFileName" value="">').appendTo('#imgForm');
    $('<input type="text" class="hidden selectedPageName" name="selectedPageName" value="">').appendTo('body');

    // GitHub info from localStorage
    const token = localStorage.getItem('feature_key');
    const repoOwner = localStorage.getItem('owner');
    const repoName = localStorage.getItem('repo_name');
    const branch = "main";

    // Convert file to base64
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }

    // Get latest SHA for a file in GitHub
    async function getLatestSha(filePath) {
        try {
            const res = await fetch(
                `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`,
                {
                    headers: {
                        Authorization: `token ${token}`,
                        Accept: "application/vnd.github+json"
                    }
                }
            );
            if (res.ok) return (await res.json()).sha;
        } catch {
            console.warn("Could not fetch latest SHA for", filePath);
        }
        return null;
    }

    // Extract GitHub repo path from image src
    function extractRepoPath(imgSrc) {
        return imgSrc
            .replace(/^https?:\/\/[^/]+\//, '')    // remove domain
            .replace(/^testing\//, '')             // remove "testing/" prefix
            .replace(/^\/+/, '')                   // remove leading slashes
            .replace(/^.*?(assets\/)/, 'assets/'); // trim everything before "assets/"
    }

    // Click event for updating image
    $(document).on('click', '.updateImg', function () {
        if (localStorage.getItem("featureEnabled") === "load buttons") {
            let imgName = "default";

            if ($(this).attr("src")) {
                imgName = $(this).attr("src");
            } else {
                const bgImg = $(this).css('background-image');
                if (bgImg && bgImg.includes('url(')) {
                    imgName = bgImg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                }
            }

            if (imgName.includes("?")) imgName = imgName.split("?")[0];

            $(".formFieldFileName").val(imgName);
            $("#image-upload").data('imageElement', this);
            $("#image-upload").click();
        } else {
            return;
        }
    });

    // Trigger upload when file selected
    $("#image-upload").on('change', function () {
        uploadImgData();
    });

    // Upload image to GitHub
    async function uploadImgData() {
        const fileInput = $("#image-upload")[0];
        const file = fileInput.files[0];
        if (!file) return
        showCustomAlertBox('error', 'No file selected!');
        console.log("No file selected!");

        const imgName = $(".formFieldFileName").val();
        const element = $("#image-upload").data("imageElement");

        // Convert to base64
        const base64 = await toBase64(file);
        const repoImagePath = extractRepoPath(imgName);

        if (!repoImagePath) {
            showCustomAlertBox('error', 'Unable to determine GitHub path for image!');
            console.log("Unable to determine GitHub path for image!");
            return;
        }

        // Get latest SHA from GitHub
        const sha = await getLatestSha(repoImagePath);
        const commitMessage = `Update ${repoImagePath} via web editor`;

        // Upload to GitHub
        const response = await fetch(
            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${repoImagePath}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `token ${token}`,
                    Accept: "application/vnd.github+json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content: base64.split(",")[1],
                    sha: sha,
                    branch: branch,
                }),
            }
        );

        const result = await response.json();

        if (result.content && result.commit) {
            console.log("GitHub image updated:", repoImagePath);

            // Update image on page with cache-busting
            const newSrc = `${imgName}?${Date.now()}`;
            if (element.tagName === "IMG") {
                $(element).attr("src", newSrc);
            } else {
                $(element).css("background-image", `url(${newSrc})`);
            }
            showCustomAlertBox('success', 'Image updated on GitHub!');
            console.log("Image updated on GitHub!");
        } else {
            showCustomAlertBox('error', 'Upload failed: ' + (result.message || "Unknown error"));
            console.log("Upload failed: " + (result.message || "Unknown error"));
        }

        // Reset file input
        fileInput.value = "";
    }
});