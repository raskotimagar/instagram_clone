/***************Post**************************/
const postsContainer = document.querySelector(".posts");
if (postsContainer) {
  // Fetch data from the API
  fetch("/api/posts/")
    .then((response) => response.json())
    .then((post_data) => {
      post_data.forEach((post) => {
        // Create a new post div
        const postDiv = document.createElement('div');
        postDiv.classList.add("post");
        postDiv.innerHTML = `
          <div class="info">
            <div style="cursor:pointer;" class="person">
              <img src="${post.user.profile_image}">
              <a href="/profile/${post.user.username}/">
                ${post.user.username}
                <svg aria-label="Verified" fill="rgb(0, 149, 246)" height="12" role="img" viewBox="0 0 40 40" width="12">
                  <title>Verified</title>
                  <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fill-rule="evenodd"></path>
                </svg> 
              </a>
              <span class="circle">.</span>
              <span>${post.created_at}</span>
            </div>
            <div class="more">
              <svg aria-label="More Options" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
              <title>More Options</title>
              <circle cx="12" cy="12" r="1.5"></circle>
              <circle cx="6" cy="12" r="1.5"></circle>
              <circle cx="18" cy="12" r="1.5"></circle>
              </svg>
            </div>
          </div>
          <div class="image">
            ${post.image ? `<img src="${post.image}">` : `<video src="${post.video}" controls></video>`}
          </div>
          <div class="desc">
            <div class="icons">
              <div class="icon_left d-flex">
                <div class="like">
                  <button class="like-button" data-post-id="${ post.id }" style="background: none; border: none; padding: 0; ">
                    <svg aria-label="Like" class="not_loved" fill=" var(--bs-body-color)" height="24" role="img" viewBox="0 0 24 24" width="24" data-post-id="${ post.id }" style="display: ${post.is_liked ? 'none' : 'inline'}; color: var(--bs-body-color);">
                      <title>Like</title>
                      <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                    </svg>
                    <svg aria-label="Unlike" class="loved" fill="red" height="24" role="img" viewBox="0 0 48 48" width="24" data-post-id="${ post.id }" style="display: ${post.is_liked ? 'inline' : 'none'}; color:red;">
                      <title>Unlike</title>
                      <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                    </svg>
                  </button>
                </div>
                <div class="chat">
                  <button type="button" class="btn p-0" data-bs-toggle="modal" data-bs-target="#message_modal">
                    <svg aria-label="Comment"  fill="black" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <title>Comment</title>
                      <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path>
                    </svg>
                  </button>
                </div>
                <div class="send">
                  <button type="button" class="btn p-0" data-bs-toggle="modal" data-bs-target="#send_message_modal">
                    <svg aria-label="Share"  fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <title>Share</title>
                      <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                      <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="save not_saved">
                <svg aria-label="Save" class="not_saved" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                  <title>Save</title>
                  <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon>
                </svg>
                <svg aria-label="Remove" class="hide saved" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                  <title>Remove</title>
                  <path d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"></path>
                </svg>
              </div>
            </div>
            <div class="liked">
              <a class="bold like-count" href="#" data-post-id="${post.id}">${post.likes.length} likes</a>
            </div>
            <div class="post_desc">
              <p>
                <a class="bold" href="#">${post.user.username}
                  <svg aria-label="Verified" class="x1lliihq x1n2onr6" fill="rgb(0, 149, 246)" height="12" role="img" viewBox="0 0 40 40" width="12">
                  <title>Verified</title>
                  <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fill-rule="evenodd"></path>
                  </svg> 
                </a>
                ${post.caption}
              </p>
              <p><a class="gray" href="#">View all ${post.likes.length} comments</a></p>
              <input type="text" placeholder="Add a comment...">
            </div>
          </div>
        `;
        // Append the new post to the posts container
        postsContainer.appendChild(postDiv);
      });
    })
    .catch((error) => console.error('Error fetching posts:', error));
    
  // Event delegation for like/unlike actions
  postsContainer.addEventListener("click", function (event) {
    const target = event.target.closest(".like-button");

    if (target) {
        const postId = target.getAttribute("data-post-id");

        // Send the POST request to like/unlike the post
        fetch(`/api/posts/${postId}/like/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
        })
        .then(response => response.json())
        .then(data => {
            // Define icons for not_loved and loved states
            const likeIconNotLoved = target.querySelector(`.not_loved`);
            const likeIconLoved = target.querySelector(`.loved`);

            // Toggle visibility based on the 'liked' status from the response
            if (data.liked) {
                likeIconNotLoved.style.display = "none";
                likeIconLoved.style.display = "inline";
            } else {
                likeIconNotLoved.style.display = "inline";
                likeIconLoved.style.display = "none";
            }

            // Update the like count text for this post
            const likeCount = document.querySelector(`.like-count[data-post-id="${postId}"]`);
            if (likeCount) {
                likeCount.textContent = `${data.like_count} likes`;
            }
        })
        .catch(error => console.error("Error updating like:", error));
    }
  });


} else {
  console.log('Posts container not found.');
}

// Helper function to get CSRF token
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}






/***************explore**********/
const explores = document.querySelector('.explore_container');

if (explores) {
  fetch('/api/posts/explore/') 
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log('Explore Data:', data); // Debugging: log the API data

      if (!Array.isArray(data) || data.length === 0) {
        console.error('No explore data available:', data);
        return;
      }

      let index = 0; 

      while (index < data.length) {
        const containerDiv = document.createElement('div');
        containerDiv.classList.add('main-container');

        const smallLargeContainer = document.createElement('div');
        smallLargeContainer.classList.add('small-large-block-container');

        const smallBoxesContainer = document.createElement('div');
        smallBoxesContainer.classList.add('small-boxes-container');

        let smallBoxAdded = false;
        for (let i = 0; i < 4 && index < data.length; i++) {
          const item = data[index++];
          const smallBox = document.createElement('div');
          smallBox.classList.add('small-box');

          if (item.image) {
            smallBox.innerHTML = `<img class="img-fluid" src="${item.image}" alt="Image">`;
            smallBoxesContainer.appendChild(smallBox);
            smallBoxAdded = true;
          } else if (item.video) {
            smallBox.innerHTML = `
              <video class="video-fluid" controls>
                <source src="${item.video}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            `;
            smallBoxesContainer.appendChild(smallBox);
            smallBoxAdded = true;
          }
        }

        // Add a large box (only videos, autoplayed and muted)
        let largeBoxAdded = false;
        const largeBox = document.createElement('div');
        largeBox.classList.add('large-box');

        while (index < data.length) {
          const item = data[index++];
          if (item.video) {
            largeBox.innerHTML = `
              <video class="video-fluid" autoplay muted loop>
                <source src="${item.video}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            `;
            largeBoxAdded = true;
            break; // Stop searching once a video is found
          }
        }

        // Append the small boxes and large box only if they contain content
        if (smallBoxAdded) smallLargeContainer.appendChild(smallBoxesContainer);
        if (largeBoxAdded) smallLargeContainer.appendChild(largeBox);

        // Only append the layout if it has valid content
        if (smallBoxAdded || largeBoxAdded) {
          containerDiv.appendChild(smallLargeContainer);
        }

        // Generate the second layout (.small-large-block-container-reverse)
        const smallLargeContainerReverse = document.createElement('div');
        smallLargeContainerReverse.classList.add('small-large-block-container-reverse');

        // Populate up to 4 more small boxes for the reverse layout
        const smallBoxesContainerReverse = document.createElement('div');
        smallBoxesContainerReverse.classList.add('small-boxes-container');

        smallBoxAdded = false;
        for (let i = 0; i < 4 && index < data.length; i++) {
          const item = data[index++];
          const smallBox = document.createElement('div');
          smallBox.classList.add('small-box');

          if (item.image) {
            smallBox.innerHTML = `<img class="img-fluid" src="${item.image}" alt="Image">`;
            smallBoxesContainerReverse.appendChild(smallBox);
            smallBoxAdded = true;
          } else if (item.video) {
            smallBox.innerHTML = `
              <video class="video-fluid" controls>
                <source src="${item.video}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            `;
            smallBoxesContainerReverse.appendChild(smallBox);
            smallBoxAdded = true;
          }
        }

        // Add another large box (only videos, autoplayed and muted)
        largeBoxAdded = false;
        const largeBoxReverse = document.createElement('div');
        largeBoxReverse.classList.add('large-box');

        while (index < data.length) {
          const item = data[index++];
          if (item.video) {
            largeBoxReverse.innerHTML = `
              <video class="video-fluid" autoplay muted loop>
                <source src="${item.video}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            `;
            largeBoxAdded = true;
            break; // Stop searching once a video is found
          }
        }

        // Append the small boxes and large box only if they contain content
        if (smallBoxAdded) smallLargeContainerReverse.appendChild(smallBoxesContainerReverse);
        if (largeBoxAdded) smallLargeContainerReverse.appendChild(largeBoxReverse);

        // Only append the reverse layout if it has valid content
        if (smallBoxAdded || largeBoxAdded) {
          containerDiv.appendChild(smallLargeContainerReverse);
        }

        // Append the main container to the explore section only if it has content
        if (containerDiv.children.length > 0) {
          explores.appendChild(containerDiv);
        }
      }
    })
    .catch((error) => {
      console.error('Error fetching explore data:', error);
    });
}



/*****************Reels********************/
const reels_container = document.querySelector(".reels");
async function fetchReels() {
    try {
        const response = await fetch('/api/reels/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
            }
        });
        if (!response.ok) throw new Error('Failed to fetch reels');
        const reels_data = await response.json();
        renderReels(reels_data);
        updateVideoListeners();  
        attachButtonListeners(); 
        attachLikeListeners(); 
    } catch (error) {
        console.error('Error fetching reels:', error);
    }
}

function renderReels(reels_data) {
  reels_container.innerHTML = ''; 

  reels_data.forEach((reel, index) => {
      const reel_div = document.createElement('div');
      reel_div.classList.add('reel');
      if (index === 0) reel_div.setAttribute('id', 'video_play');

      reel_div.innerHTML = `
          <div class="video">
              <video src="${reel.video}" ${index === 0 ? 'autoplay' : ''} loop></video>
              <div class="content">
                  <div class="sound">
                      <svg aria-label="Audio is playing" class="volume-up" fill="white" height="16" role="img" viewBox="0 0 24 24" width="16">
                        <title>Audio is playing</title>
                        <path d="M16.636 7.028a1.5 1.5 0 10-2.395 1.807 5.365 5.365 0 011.103 3.17 5.378 5.378 0 01-1.105 3.176 1.5 1.5 0 102.395 
                        1.806 8.396 8.396 0 001.71-4.981 8.39 8.39 0 00-1.708-4.978zm3.73-2.332A1.5 1.5 0 1018.04 6.59 8.823 8.823 0 0120 12.007a8.798 
                        8.798 0 01-1.96 5.415 1.5 1.5 0 002.326 1.894 11.672 11.672 0 002.635-7.31 11.682 11.682 0 00-2.635-7.31zm-8.963-3.613a1.001 1.001 
                        0 00-1.082.187L5.265 6H2a1 1 0 00-1 1v10.003a1 1 0 001 1h3.265l5.01 4.682.02.021a1 1 0 001.704-.814L12.005 2a1 1 0 00-.602-.917z"></path>
                      </svg>
                      <svg aria-label="Audio is muted" class="volume-mute" fill="white" height="16" role="img" viewBox="0 0 48 48" width="16">
                        <title>Audio is muted</title>
                        <path clip-rule="evenodd" d="M1.5 13.3c-.8 0-1.5.7-1.5 1.5v18.4c0 .8.7 1.5 1.5 1.5h8.7l12.9 12.9c.9.9 2.5.3 2.5-1v-9.8c0-.4-.2-.8-.4-1.1l-22-22c-.3-.3-.7-.4-1.1-.4h-.6zm46.8 
                        31.4-5.5-5.5C44.9 36.6 48 31.4 48 24c0-11.4-7.2-17.4-7.2-17.4-.6-.6-1.6-.6-2.2 0L37.2 8c-.6.6-.6 1.6 0 2.2 0 0 5.7 5 5.7 13.8 0 5.4-2.1 9.3-3.8 11.6L35.5 32c1.1-1.7 2.3-4.4 
                        2.3-8 0-6.8-4.1-10.3-4.1-10.3-.6-.6-1.6-.6-2.2 0l-1.4 1.4c-.6.6-.6 1.6 0 2.2 0 0 2.6 2 2.6 6.7 0 1.8-.4 3.2-.9 4.3L25.5 22V1.4c0-1.3-1.6-1.9-2.5-1L13.5 10 3.3-.3c-.6-.6-1.5-.6-2.1 
                        0L-.2 1.1c-.6.6-.6 1.5 0 2.1L4 7.6l26.8 26.8 13.9 13.9c.6.6 1.5.6 2.1 0l1.4-1.4c.7-.6.7-1.6.1-2.2z" fill-rule="evenodd"></path>
                      </svg>
                  </div>
                  <div class="play">
                    <svg aria-label="Play button icon" fill="white" height="24" role="img" viewBox="0 0 24 24" width="24">
                      <title>Play button icon</title>
                      <path d="M5.888 22.5a3.46 3.46 0 0 1-1.721-.46l-.003-.002a3.451 3.451 0 0 1-1.72-2.982V4.943a3.445 3.445 0 0 1 5.163-2.987l12.226 
                      7.059a3.444 3.444 0 0 1-.001 5.967l-12.22 7.056a3.462 3.462 0 0 1-1.724.462Z"></path>
                    </svg>
                  </div>
                  <div class="info">
                      <div class="profile">
                          <h4>
                              <a href="#"><img src="${reel.user.profile_image}">${reel.user.username}</a>
                          </h4>
                          <span>.</span>
                          <button class="follow_text">Follow</button>
                      </div>
                      <div class="desc">
                          <p>${reel.caption || ''} <span class="show_text">more</span></p>
                          <div class="more">
                              <div class="music">🎵<span>${reel.music || 'Original Music'}</span></div>
                              <div class="position"><span>${reel.location || ''}</span></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="likes">
              <div class="like">
                <button class="like-button" data-reel-id="${ reel.id }" style="background: none; border: none; padding: 0;">
                  <svg aria-label="Like" class="not_loved" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24" data-reel-id="${ reel.id }" style="display: ${reel.is_liked ? 'none' : 'inline'};">
                    <title>Like</title>
                    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z"></path>
                  </svg>
                  <svg aria-label="Unlike" class="loved" fill="currentColor" height="24" role="img" viewBox="0 0 48 48" width="24" data-reel-id="${ reel.id }" style="display: ${reel.is_liked ? 'inline' : 'none'}; color:red;">
                    <title>Unlike</title>
                    <path d="M34.6 3.1c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5s1.1-.2 1.6-.5c1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path>
                  </svg>
                </button> 
                <p class="bold like-count" data-reel-id="${reel.id}">${reel.likes.length}</p>
              </div>
              <div class="message">
                  <button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#message_modal">
                      <svg aria-label="Comment"  fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                        <title>Comment</title>
                        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></path>
                      </svg>
                      <p>${reel.comment_count || 0}</p>
                  </button>
              </div>
              <div class="send">
                <button type="button" class="btn" data-bs-toggle="modal" data-bs-target="#send_message_modal">
                  <svg aria-label="Share"  fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                    <title>Share</title>
                    <line fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" x1="22" x2="9.218" y1="3" y2="10.083"></line>
                    <polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" stroke-linejoin="round" stroke-width="2"></polygon>
                  </svg>
                </button>
              </div>
              <div class="save">
                <svg aria-label="Save" class="not_saved" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                  <title>Save</title>
                  <polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon>
                </svg>
                <svg aria-label="Remove" class="hide saved" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                  <title>Remove</title>
                  <path d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"></path>
                </svg>
              </div>
              <div class="more">
                <svg aria-label="More Options" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                  <title>More Options</title>
                  <circle cx="12" cy="12" r="1.5"></circle>
                  <circle cx="6" cy="12" r="1.5"></circle>
                  <circle cx="18" cy="12" r="1.5"></circle>
                </svg
              </div>
              <div class="profile"><img src="${reel.user.profile_image}"></div>
          </div>
      `;

      reels_container.appendChild(reel_div);
  });
}

/**************************Video Scroll Logic**************************/
function updateVideoListeners() {
  const videos = document.querySelectorAll("video");

  const observer = new IntersectionObserver(
      entries => {
          entries.forEach(entry => {
              const video = entry.target;
              const allVideos = document.querySelectorAll("video");

              if (entry.isIntersecting) {
                  allVideos.forEach(v => {
                      if (v !== video) v.pause(); 
                  });
                  video.play(); 
              } else {
                  video.pause(); 
              }
          });
      },
      {
          threshold: 0.5, 
      }
  );
  // Observe all videos
  videos.forEach(video => observer.observe(video));
}

/**************************Button Listeners**************************/
function attachButtonListeners() {
    document.querySelectorAll(".sound").forEach(mute_btn => {
        const video = mute_btn.closest(".video").querySelector("video");
        const volumeUp = mute_btn.querySelector(".volume-up");
        const volumeMute = mute_btn.querySelector(".volume-mute");
    
        // Helper function to update icons based on mute state
        const updateIcons = () => {
            if (video.muted) {
                volumeUp.style.display = "none";
                volumeMute.style.display = "inline-block";
            } else {
                volumeUp.style.display = "inline-block";
                volumeMute.style.display = "none";
            }
        };
        updateIcons();
        mute_btn.addEventListener("click", e => {
            e.stopPropagation();
            video.muted = !video.muted;
            updateIcons();
        });
    });


    document.querySelectorAll(".follow_text").forEach(follow => {
        follow.addEventListener("click", e => {
            e.stopPropagation();
            follow.classList.toggle("following");
            follow.textContent = follow.classList.contains("following") ? "Following" : "Follow";
        });
    });

    document.querySelectorAll(".video").forEach(item => {
        const video = item.querySelector("video");
        const button_play = item.querySelector(".play");

        item.addEventListener("click", () => {
            if (video.paused) {
                video.play();
                button_play.classList.remove("opac_1");
            } else {
                video.pause();
                button_play.classList.add("opac_1");
            }
        });
    });
}

/**************************Like Button Logic**************************/
function attachLikeListeners() {
  reels_container.addEventListener("click", function (event) {
    const target = event.target.closest(".like-button");

    if (target) {
        const reelId = target.getAttribute("data-reel-id");

        // Send the POST request to like/unlike the post
        fetch(`/api/reels/${reelId}/like/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
        })
        .then(response => response.json())
        .then(data => {
            // Define icons for not_loved and loved states
            const likeIconNotLoved = target.querySelector(`.not_loved`);
            const likeIconLoved = target.querySelector(`.loved`);

            // Toggle visibility based on the 'liked' status from the response
            if (data.liked) {
                likeIconNotLoved.style.display = "none";
                likeIconLoved.style.display = "inline";
            } else {
                likeIconNotLoved.style.display = "inline";
                likeIconLoved.style.display = "none";
            }

            // Update the like count text for this post
            const likeCount = document.querySelector(`.like-count[data-reel-id="${reelId}"]`);
            if (likeCount) {
                likeCount.textContent = `${data.like_count}`;
            }
        })
        .catch(error => console.error("Error updating like:", error));
    }
  });
}

/**************************Debounce Function**************************/
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

fetchReels();



/**************************search+notif-section **************************/
// Search section
let search = document.getElementById("search");
let search_icon = document.getElementById("search_icon");

search_icon.addEventListener("click", function() {
  search.classList.toggle("show");
});

// Close modal if clicked outside
document.addEventListener("click", function (event) {
  if (!search.contains(event.target) && !search_icon.contains(event.target)) {
    search.classList.remove("show");
  }
});

document.getElementById("searchBar").addEventListener("keyup", function() {
  let query = this.value.trim();
  
  if (query.length > 0) {
    fetch(`/api/userprofile/?search=${encodeURIComponent(query)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        displaySearchResults(data);
      })
      .catch(error => {
        console.error('Error:', error);
        displayErrorMessage('Failed to fetch search results. Please try again.');
      });
  } else {
    clearSearchResults();
  }
});

function displaySearchResults(users) {
  const accountContainer = document.querySelector(".account");
  accountContainer.innerHTML = ''; // Clear existing results

  if (users.length === 0) {
    accountContainer.innerHTML = '<p class="no-results">No users found.</p>';
    return;
  }

  users.forEach(user => {
    const cart = document.createElement("div");
    cart.classList.add("cart");
    cart.innerHTML = `
      <a href="/profile/${user.username}/">
        <div>
          <div class="img">
            <img style="width:40px; height:40px;" src="${user.profile_image}" alt="${user.username}">
          </div>
          <div class="info">
            <p class="name">${user.username}</p>
            <p class="second_name">${user.full_name}</p>
          </div>
        </div>
        <div class="clear">
          <a href="#">X</a>
        </div>
      </a>
    `;
    accountContainer.appendChild(cart);
  });
}

function clearSearchResults() {
  document.querySelector(".account").innerHTML = '';
}

function displayErrorMessage(message) {
  const accountContainer = document.querySelector(".account");
  accountContainer.innerHTML = `<p class="error">${message}</p>`;
}



// Notification section;
let notification = document.getElementById("notification");
let notification_icon = document.querySelectorAll(".notification_icon");
notification_icon.forEach( (notif)=>{
  notif.addEventListener('click',function(){
    notification.classList.toggle("show");
  })
} 
)


/**************************icons+text change **************************/
//change the icon when the user click on it

/*
// Event listener for like/unlike button click
document.querySelectorAll('.like-button').forEach(button => {
  button.addEventListener('click', function(event) {
      const postId = event.target.getAttribute('data-post-id');
      const isLiked = event.target.classList.contains('liked');  // Check if already liked
      const authToken = 'your-auth-token';  // Get auth token

      const url = `/posts/${postId}/like/`;

      fetch(url, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
          }
      })
      .then(response => response.json())
      .then(data => {
          // Update like status and like count
          event.target.classList.toggle('liked', !isLiked);
          event.target.classList.toggle('not-liked', isLiked);
          document.querySelector(`#like-count-${postId}`).textContent = data.like_count;
      })
      .catch(error => console.error('Error:', error));
  });
});
*/


// Function to handle saving a post
document.querySelectorAll('.save svg').forEach(button => {
  button.addEventListener('click', function(event) {
      const postId = event.target.getAttribute('data-post-id');
      const isSaved = event.target.classList.contains('saved');
      const authToken = 'your-auth-token';
      
      const url = isSaved ? `/saves/remove/` : `/saves/`;
      
      fetch(url, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ post_id: postId })  // Send the post ID in the body
      })
      .then(response => response.json())
      .then(data => {
          event.target.classList.toggle('saved', !isSaved);
          event.target.classList.toggle('not_saved', isSaved);
      })
      .catch(error => console.error('Error:', error));
  });
});


// Function to get CSRF token
function getCSRFToken() {
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  return csrfToken;
}

//notification follow 
let not_follow = document.querySelectorAll("#notification .notif.follow_notif")
not_follow.forEach(item=>{
  let follow = item.children[0].children[1].children[0];
  follow.addEventListener("click", function(e){
    e.stopPropagation();
    follow.classList.toggle("following");
    if(follow.classList.contains("following")){
      follow.innerHTML= "Following";
      follow.style.backgroundColor = 'rgb(142, 142, 142)';
      follow.style.color = "black";
    }else{
      follow.innerHTML= "Follow";
      follow.style.backgroundColor = 'rgb(0, 149, 246)';
      follow.style.color = "white";
    }
    
  });
})

/**************************comments **************************/

//comments
let replay_com = document.querySelector(".comments .responses");
let show_replay = document.querySelector(".comments .see_comment");
let hide_com = document.querySelector(".comments .see_comment .hide_com");
let show_com = document.querySelector(".comments .see_comment .show_c");
if(replay_com){
  replay_com.classList.add("hide");
  hide_com.classList.add("hide");
  show_replay.addEventListener("click",function(){
    replay_com.classList.toggle("hide");
    show_com.classList.toggle("hide");
    hide_com.classList.toggle("hide");
  });
}


/*************emojie*************** */
$(document).ready(function() {
	$("#emoji").emojioneArea({
  	pickerPosition: "top",
    tonesStyle: "radio"
  });
});

$(document).ready(function() {
	$("#emoji_create").emojioneArea({
  	pickerPosition: "bottom",
    tonesStyle: "radio"
  });
});

$(document).ready(function() {
	$("#emoji_comment").emojioneArea({
  	pickerPosition: "bottom",
    tonesStyle: "radio"
  });
});

//Upload
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('upload-form');
  const imageInput = document.getElementById('image-upload');
  const imgContainer = document.querySelector("#image-container");
  const nextBtnPost = document.querySelector(".next_btn_post");
  const titleCreate = document.querySelector(".title_create");
  const imageDescription = document.querySelector("#image_description");
  const postPublished = document.querySelector('.post_published');
  const modalDialog = document.querySelector("#create_modal .modal-dialog");
  const modal = document.getElementById("create_modal");
  let mediaURL = null;
  let mediaFile = null;  // to store the file object
  let isVideo = false;

  // Initialize Modal State
  function initializeModal() {
      titleCreate.textContent = 'Create new post';
      nextBtnPost.textContent = '';
      nextBtnPost.classList.add('next_btn_post');
      nextBtnPost.classList.remove('share_btn_post');
      imgContainer.classList.add('hide_img');
      imageDescription.classList.add('hide_img');
      postPublished.classList.add('hide_img');
      imgContainer.innerHTML = '';  // Clear previous media content
      imageDescription.querySelector('.img_p').innerHTML = '';  // Clear description media
      modalDialog.classList.remove("modal_share", "modal_complete");
      imageInput.value = ''; // Clear file input
      mediaURL = null;
      mediaFile = null;
      isVideo = false;
  }

  // Handle File Selection
  form.addEventListener('change', (event) => {
      event.preventDefault();
      mediaFile = imageInput.files[0];
      if (mediaFile) {
          mediaURL = URL.createObjectURL(mediaFile);
          isVideo = mediaFile.type.startsWith("video");

          if (isVideo) {
              imgContainer.innerHTML = `<video src="${mediaURL}" class="media_item" controls></video>`;
          } else {
              imgContainer.innerHTML = `<img src="${mediaURL}" alt="Selected File" class="media_item">`;
          }

          imgContainer.classList.remove('hide_img');
          nextBtnPost.textContent = 'Next';
          titleCreate.textContent = 'Crop';
      }
  });

  // Proceed to "Share" View
  nextBtnPost.addEventListener('click', () => {
      if (nextBtnPost.classList.contains('next_btn_post')) {
          // Transition from Crop to Share View
          modalDialog.classList.add("modal_share");
          imageDescription.classList.remove('hide_img');
          titleCreate.textContent = 'Create new post';
          nextBtnPost.textContent = 'Share';
          nextBtnPost.classList.remove("next_btn_post");
          nextBtnPost.classList.add("share_btn_post");

          // Display the selected media in the Share view
          if (isVideo) {
              imageDescription.querySelector('.img_p').innerHTML = `<video src="${mediaURL}" class="media_item" controls></video>`;
          } else {
              imageDescription.querySelector('.img_p').innerHTML = `<img src="${mediaURL}" alt="Selected File" class="media_item">`;
          }
      } else {
          // Submit post to backend
          submitPost();
          bootstrap.Modal.getInstance(modal).hide();
      }
  });

  // Submit Post to Backend
  async function submitPost() {
      const caption = document.getElementById("emoji_create")?.value || "";
      const locationInput = document.querySelector("#location");  // Corrected selector
      const location = locationInput ? locationInput.value : "";

      const formData = new FormData();
      
      if (isVideo) {
          formData.append("video", imageInput.files[0]);
      } else {
          formData.append("image", imageInput.files[0]);
      }
      
      formData.append("caption", caption);
      formData.append("location", location);

      const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

      try {
          const response = await fetch('/api/posts/', {
              method: 'POST',
              body: formData,
              headers: {
                  'X-CSRFToken': csrftoken
              },
          });

          if (response.ok) {
              console.log("Post uploaded successfully!");
              const successMessage = document.createElement('div');
              successMessage.classList.add('success-message');
              successMessage.textContent = 'Post uploaded successfully!';
              document.body.appendChild(successMessage);
              successMessage.style.display = 'block';  
              console.log("Success message added to DOM", successMessage);
              setTimeout(() => {
                  successMessage.style.display = 'none'; // Hide after 3 seconds
              }, 3000);   
              bootstrap.Modal.getInstance(modal).hide();
          } else {
              console.error("Failed to upload post");
          }
      } catch (error) {
          console.error("Error uploading post:", error);
      }
  }


  // Discard Post Confirmation
  modal.addEventListener("click", (event) => {
      if (event.target === modal) {
          const discard = confirm("Do you want to discard this post?");
          if (discard) {
              initializeModal();
              bootstrap.Modal.getInstance(modal).hide();
          }
      }
  });

  initializeModal();  // Initialize modal on page load
});




function toggleTheme() {
    const theme = document.body.getAttribute('data-bs-theme');
    if (theme === 'dark') {
        document.body.setAttribute('data-bs-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.setAttribute('data-bs-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Check saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-bs-theme', savedTheme);
});






