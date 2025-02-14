function getCurrentUsername() {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const profileIndex = pathSegments.indexOf('profile');
  return profileIndex !== -1 ? pathSegments[profileIndex + 1] : null;
}

const username = getCurrentUsername() || document.querySelector('.name')?.textContent?.replace('@', '');

if (username) {
  const profileContainer = document.querySelector(".profile_container");
  if(profileContainer){
    Promise.all([
      fetch(`/api/userprofile/${username}`, { credentials: 'include' }),
      fetch('/chat/self', { credentials: 'include' })
    ])
    .then(async ([profileRes, currentUserRes]) => {
      if (!profileRes.ok) throw new Error('Profile fetch failed');
      const profile = await profileRes.json();
      const currentUser = await currentUserRes.json();
      
      const isOwnProfile = currentUser.username === profile.username;
      const followStatus = profile.is_following ? 'Following' : 'Follow';

      profileContainer.innerHTML = `
        <div class="profile_info">
          <div class="cart">
            <div class="img">
              <img src="${profile.profile_image}" alt="Profile Image">
            </div>
            <div class="info">
              <div class="profile-header">
                <div class="username-section">
                  <h3>${profile.username}</h3>
                    <svg aria-label="Verified" class="verified-badge" viewBox="0 0 40 40">
                      <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z"/>
                    </svg>
                </div>
                <div class="profile-actions">
                  ${isOwnProfile ? `
                    <button class="edit-profile-btn">Edit Profile</button>
                    <button class="view-archive-btn">View Archive</button>
                  ` : `
                    <button class="follow-btn ${followStatus}">${followStatus.charAt(0).toUpperCase() + followStatus.slice(1)}</button>
                    <button class="message-btn">Message</button>
                    <button class="more-options-btn">
                      <svg aria-label="More options" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="1.5"></circle>
                        <circle cx="6" cy="12" r="1.5"></circle>
                        <circle cx="18" cy="12" r="1.5"></circle>
                      </svg>
                    </button>
                  `}
                </div>
              </div>

              <div class="profile-stats">
                <span>${profile.post_count} posts</span>
                <span>${profile.followers.length} followers</span>
                <span>${profile.following.length} following</span>
              </div>

              <div class="profile-details">
                <p>${profile.full_name}</p>
                <p>${profile.bio}</p>
                ${profile.website ? `<a href="${profile.website}" target="_blank">${profile.website}</a>` : ''}
              </div>
            </div>
          </div>
        </div>

        ${isOwnProfile ? `
        <div class="profile-tools">
          <button class="story-highlight">
            <div class="add-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </div>
            New
          </button>
        </div>` : ''}


        <!-- Add Modal HTML -->
        <div class="modal fade" id="editProfileModal" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Edit Profile</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form id="profileEditForm" enctype="multipart/form-data">
                <div class="modal-body">
                  <div class="d-flex gap-4">
                    <!-- Left Column - Profile Image -->
                    <div class="text-center">
                      <div class="profile-image-container mb-3">
                        <img src="${profile.profile_image}" 
                            class="rounded-circle" 
                            id="profileImagePreview"
                            style="width: 150px; height: 150px; object-fit: cover;">
                        <label class="btn btn-sm btn-outline-secondary mt-2">
                          Change Photo
                          <input type="file" name="profile_image" 
                                class="d-none" id="id_profile_image">
                        </label>
                      </div>
                    </div>

                    <!-- Right Column - Form Fields -->
                    <div class="flex-grow-1">
                      <div class="mb-3">
                        <label class="form-label">Username</label>
                        <input type="text" class="form-control" name="username" value="${profile.username}">
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-control" name="full_name" value="${profile.full_name}">
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Bio</label>
                        <textarea class="form-control" name="bio" rows="3">${profile.bio}</textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>


        <div class="highlights">
            <div class="highlight">
                <div class="img">
                    <img src="https://i.pinimg.com/originals/f6/4a/3e/f64a3ed4da26ddb0d98447a9b5b638c5.gif" alt="">
                </div>
                <p>conseils</p>
            </div>
            <div class="highlight highlight_add">
                <div class="img">
                    <svg aria-label="Plus icon" class="plus-icon" height="44" width="44" viewBox="0 0 24 24">
                        <path d="M21 11.3h-8.2V3c0-.4-.3-.8-.8-.8s-.8.4-.8.8v8.2H3c-.4 0-.8.3-.8.8s.3.8.8.8h8.2V21c0 .4.3.8.8.8s.8-.3.8-.8v-8.2H21c.4 0 .8-.3.8-.8s-.4-.7-.8-.7z"></path>
                    </svg>
                </div>
                <p>New</p>
            </div>
        </div>
        <hr>
        <div class="posts_profile">
            <ul class="nav-pills w-100 d-flex justify-content-center" id="pills-tab" role="tablist">
                <li class="nav-item mx-2" role="presentation">
                    <button class="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">
                        <svg aria-label=""  fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><title></title><rect fill="none" height="18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="18" x="3" y="3"></rect><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="9.015" x2="9.015" y1="3" y2="21"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="14.985" x2="14.985" y1="3" y2="21"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="21" x2="3" y1="14.985" y2="14.985"></line></svg>
                        POSTS
                    </button>
                </li>
                <li class="nav-item mx-2" role="presentation">
                <button class="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">
                    <svg aria-label=""  fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><title></title><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></polygon></svg>
                    SAVED
                </button>
                </li>
                <li class="nav-item mx-2" role="presentation">
                <button class="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact" type="button" role="tab" aria-controls="pills-contact" aria-selected="false">
                    <svg aria-label=""  fill="currentColor" height="12" role="img" viewBox="0 0 24 24" width="12"><title></title><path d="M10.201 3.797 12 1.997l1.799 1.8a1.59 1.59 0 0 0 1.124.465h5.259A1.818 1.818 0 0 1 22 6.08v14.104a1.818 1.818 0 0 1-1.818 1.818H3.818A1.818 1.818 0 0 1 2 20.184V6.08a1.818 1.818 0 0 1 1.818-1.818h5.26a1.59 1.59 0 0 0 1.123-.465Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><path d="M18.598 22.002V21.4a3.949 3.949 0 0 0-3.948-3.949H9.495A3.949 3.949 0 0 0 5.546 21.4v.603" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path><circle cx="12.072" cy="11.075" fill="none" r="3.556" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle></svg>
                    TAGGED
                </button>
                </li>
            </ul>
            <div class="tab-content" id="pills-tabContent">
                <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab" tabindex="0">
                    <div id="posts_sec" class="post">
                    
                    </div>
                </div>
                <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab" tabindex="0">
                    <div id="saved_sec" class="post">
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/originals/8d/be/96/8dbe966e815f9aa53bd12d9bb640b83c.gif" alt="">
                        </div>
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/originals/aa/29/c8/aa29c87da305509a8a4aa38ad45fe508.gif" alt="">
                        </div>
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/originals/70/37/d4/7037d478852af21357f038fac2d2e9f6.gif" alt="">
                        </div>
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/originals/fc/21/16/fc2116fb21de12a62d4b36c31bbb1e6f.gif" alt="">
                        </div>
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/originals/01/94/b2/0194b213acbd29cc2efadf7b427e638b.gif" alt="">
                        </div>
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/originals/e3/9c/5d/e39c5d4994e9835270e80e78ca7d7e95.gif" alt="">
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab" tabindex="0">
                    <div id="tagged" class="post">
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/736x/7d/d3/ba/7dd3baaac8ae7adb6f689d9767a08cc7.jpg" alt="">
                        </div>
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/736x/5e/20/4d/5e204da0d41edc5006ddfedb52e060a3.jpg" alt="">
                        </div>
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/originals/16/11/b9/1611b900b2231114ba050c3f82eb84c6.gif" alt="">
                        </div>
                        <div class="item">
                            <img class="img-fluid item_img" src="https://i.pinimg.com/originals/ff/69/00/ff690005e52c7b9107a792717e38c62e.gif" alt="">
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
        <footer class="footer">
            <div class="footer-top">
                <span>Meta</span>
                <span>About</span>
                <span>Blog</span>
                <span>Jobs</span>
                <span>Help</span>
                <span>API</span>
                <span>Privacy</span>
                <span>Terms</span>
                <span>Locations</span>
                <span>Instagram Lite</span>
                <span>Threads</span>
                <span>Contact uploading and non-users</span>
                <span>Meta Verified</span>
            </div>
            <div class="footer-bottom">
                <select>
                    <option value="en-uk">English (UK)</option>
                    <option value="en-us">English (US)</option>
                    <option value="ne">नेपाली</option>
                    <option value="ja">日本語</option>
                    <option value="zh">中文</option>
                    <option value="es">Español</option> 
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="pt">Português</option>
                </select>
                <span>© 2024 Instagram Clone. All rights reserved.</span>
            </div>
        </footer>
        `;

        if (!isOwnProfile) {
          const followBtn = document.querySelector('.follow-btn');
          
          if (followBtn) {
            followBtn.addEventListener('click', async () => {
              const isFollowing = followBtn.classList.contains('following');
              const action = isFollowing ? 'unfollow' : 'follow';
              
              try {
                followBtn.disabled = true;
                const response = await fetch(`/api/userprofiles/${username}/${action}`, {
                  method: 'POST',
                  headers: { 
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                  }
                });
        
                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.error || 'Action failed');
                }
        
                const data = await response.json();
                
                // Update button state
                followBtn.textContent = isFollowing ? 'Follow' : 'Following';
                followBtn.classList.toggle('following');
                followBtn.classList.toggle('follow');
                
                // Update followers count using the API response
                const followersSpan = document.querySelector('.profile-stats span:nth-child(2)');
                if (followersSpan) {
                  followersSpan.textContent = `${data.follower_count} followers`;
                }
        
              } catch (error) {
                console.error('Follow action failed:', error);
                alert(error.message);
              } finally {
                followBtn.disabled = false;
              }
            });
          }
        }  
       
        // Event delegation for dynamically created edit button
        document.addEventListener('click', function(e) {
          if (e.target.closest('.edit_profile')) {
            const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
            modal.show();
          }
        });

        // Image preview handler
        document.addEventListener('change', function(e) {
          if (e.target.id === 'id_profile_image') {
            const file = e.target.files[0];
            const preview = document.getElementById('profileImagePreview');
            if (file) {
              const reader = new FileReader();
              reader.onload = function(e) {
                preview.src = e.target.result;
              }
              reader.readAsDataURL(file);
            }
          }
        });
        

        document.addEventListener('submit', function(e) {
          if (e.target.id === 'profileEditForm') {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
        
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        
            // Add explicit API endpoint URL instead of using form.action
            fetch(`/api/update_profile/${encodeURIComponent(username)}/`, {
              method: 'POST',
              body: formData,
              headers: { 
                'X-CSRFToken': getCookie('csrftoken'),
                // Add Accept header to request JSON response
                'Accept': 'application/json'
              }
            })
            .then(async response => {
              const contentType = response.headers.get('content-type');
              
              // First check if response is JSON
              if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (!response.ok) {
                  throw new Error(data.message || 'Update failed');
                }
                return data;
              }
              
              // If not JSON, handle as error
              throw new Error('Server returned unexpected response format');
            })
            .then(data => {
              // Update UI as before
              if (data.success) {
                document.querySelector('.username-section h3').textContent = data.username;
                document.querySelector('.profile-details p:first-child').textContent = data.full_name;
                document.querySelector('.profile-details p:nth-of-type(2)').textContent = data.bio;
        
                const profileImages = document.querySelectorAll('.profile-image');
                profileImages.forEach(img => {
                  img.src = `${data.profile_image}?t=${Date.now()}`;
                });
        
                if (data.username !== username) {
                  window.history.replaceState(null, '', `/profile/${data.username}/`);
                }
        
                bootstrap.Modal.getInstance(form.closest('.modal')).hide();
              }
            })
            .catch(error => {
              console.error('Error:', error);
              alert(error.message || 'Update failed. Please check the form data');
            })
            .finally(() => {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Save Changes';
            });
          }
        });

        

        const postsSection = document.querySelector("#posts_sec");

        if (postsSection) {
          fetch(`/api/userposts/${username}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch posts: ${response.status}`);
              }
              return response.json();
            })
            .then((postData) => {
              let postsHTML = '';
        
              // Loop through each post and generate HTML based on whether it's an image or video
              postData.forEach(post => {
                if (post.image) {
                  postsHTML += `
                    <div class="item">
                      <img class="img-fluid item_img" src="${post.image}" alt="Post Image">
                    </div>
                  `;
                } else if (post.video) {
                  postsHTML += `
                    <div class="item">
                      <video class="img-fluid item_video" src="${post.video}" controls></video>
                    </div>
                  `;
                } else {
                  console.warn('Post with id:', post.id, 'is missing media content');
                }
              });
        
              // Insert generated HTML into the posts section or show a message if no posts are available
              postsSection.innerHTML = postsHTML || '<p>No posts to display.</p>';
            })
            .catch((error) => console.error('Error fetching posts:', error));
        }      
        
      })
      .catch((error) => console.error('Error fetching profile data:', error));
  } 
} else {
  console.error("Username not found in URL");           
}