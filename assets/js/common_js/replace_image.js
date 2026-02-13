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





     const token = "";
      const repoOwner = "";
      const repoName = "";
      let commitMessage = "Update test via API";

      const branch = "";

      function enableAllImageEditing() {
        const images = document.querySelectorAll('img');

        images.forEach((img, index) => {
          if (img.parentElement.querySelector('.edit-btn')) return;

          // Create wrapper to position the button correctly
          const wrapper = document.createElement('div');
          wrapper.style.position = 'relative';
          wrapper.style.display = 'inline-block';

          // Insert wrapper before the image and move the image inside it
          img.parentElement.insertBefore(wrapper, img);
          wrapper.appendChild(img);

          // Create the pencil edit button
          const editBtn = document.createElement('button');
          editBtn.innerHTML = '🖉'; // Pencil icon
          editBtn.className = 'edit-btn';
          editBtn.style.position = 'absolute';
          editBtn.style.top = '5px';
          editBtn.style.right = '5px';
          editBtn.style.background = '#fff';
          editBtn.style.border = '1px solid #ccc';
          editBtn.style.borderRadius = '50%';
          editBtn.style.padding = '5px';
          editBtn.style.cursor = 'pointer';
          editBtn.style.zIndex = '9999'; // Ensure it's above any other elements
          editBtn.style.transition = 'all 0.3s ease-in-out'; // Smooth transition for animations
          editBtn.title = 'Edit Image';

          // Append the button to the wrapper
          wrapper.appendChild(editBtn);

          // Hidden file input to upload new image
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.style.display = 'none';
          wrapper.appendChild(fileInput);

          // Show file input when the pencil button is clicked
          editBtn.addEventListener('click', () => {
            fileInput.click();
          });

          // Handle file input change (when a new image is selected)
          fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;

            // Convert the selected image file to Base64
            const base64Content = await toBase64(file);

            // Dynamically generate the GitHub file path from the image's src
            const imageSrc = img.getAttribute('src');
            console.log('imageSrc: ', imageSrc)
            const repoImagePath = extractRepoPath(imageSrc);
            console.log('repoImagePath: ', repoImagePath)
            commitMessage = repoImagePath
            console.log('commitMessage: ', commitMessage)
            if (!repoImagePath) {
              showCustomAlertBox('error', 'Unable to resolve GitHub file path from image src.');
              console.log('Unable to resolve GitHub file path from image src.');
              return;
            }

            const sha = await getLatestSha(repoImagePath);

            const response = await fetch(
              `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${repoImagePath}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `token ${token}`,
                  Accept: "application/vnd.github+json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  message: commitMessage,
                  content: base64Content.split(",")[1],
                  sha: sha,
                  branch: branch
                })
              }
            );

            const result = await response.json();
            console.log("Upload result:", result);

            if (result.content && result.commit) {
              // Fetch the updated image blob and set it to the image element
              const blobSha = result.content.sha;
              const latest = await fetch(
                `https://api.github.com/repos/${repoOwner}/${repoName}/git/blobs/${blobSha}`,
                {
                  headers: {
                    Authorization: `token ${token}`,
                    Accept: "application/vnd.github+json"
                  }
                }
              );
              const latestData = await latest.json();
              const imageBase64 = "data:image/png;base64," + latestData.content;
              img.src = imageBase64;
            } else {
              showCustomAlertBox('error', 'Upload failed:' + result.message);
              console.log("Upload failed: " + result.message);
            }
          });
        });
      }

      // Extract the GitHub file path from image source (src)
      function extractRepoPath(src) {
        try {
          const url = new URL(src, window.location.origin);
          const path = url.pathname;

          if (path.includes("/assets/images/")) {
            console.log('path: ', path)
            return "public" + path;
          }
        } catch (e) {
          console.error("Invalid image src:", src);
        }
        return null;
      }

      // Convert image file to base64
      function toBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      }

      // Fetch the latest SHA of the file in the GitHub repository
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
          if (res.ok) {
            const data = await res.json();
            return data.sha;
          }
        } catch (err) {
          console.warn("SHA fetch failed or file not found, will create new.");
        }
        return null;
      }

      // Run the function when the page is loaded
      document.addEventListener('DOMContentLoaded', enableAllImageEditing);