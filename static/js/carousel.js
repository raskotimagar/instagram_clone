/******************Add the story ******************/
const image_profile = [
    ['https://i.pinimg.com/originals/e4/65/b9/e465b924ffaedb24d34c9ae2c989bce1.gif','magar_'],
    ['https://i.pinimg.com/originals/ec/5f/37/ec5f377a267f9e999a5f4b13bd0fb102.gif','luffy☠️'],
    ['https://i.pinimg.com/originals/6a/25/01/6a2501c723f2d8b8f5094e61f648367a.gif','zoro'],
    ['https://i.pinimg.com/originals/44/a5/5a/44a55a9d274e0fcfac85ec6c6117a3f1.gif','ussoop'],
    ['https://i.pinimg.com/originals/d3/30/03/d33003d2e19179c1e7aeda2182a11b81.gif','sanji'],
    ['https://i.pinimg.com/originals/ef/2b/56/ef2b56f2bb1b627d50b0ee17474f2efc.gif','nami'],
    ['https://i.pinimg.com/originals/26/1f/db/261fdbdd9daff46c9771c09e8592d6e2.gif','chopper'],
    ['https://i.pinimg.com/originals/43/44/c3/4344c34c52428b4f492add4bc8036e6a.gif','robin'],
    ['https://i.pinimg.com/originals/47/22/15/47221512d8cf99bb80581691b9e5bc5a.gif','franky'],
    ['https://i.pinimg.com/originals/65/89/02/6589028d2997a81ac3a6ea1372bb53bf.gif','brook'],
    ['https://i.pinimg.com/originals/65/36/2e/65362e867448fdc06d1834a6ee0d9253.gif','chhu'],
    ['https://i.pinimg.com/originals/e6/29/49/e6294964e26db35f05e41e25e689b19d.gif','ameow😹'],
    ['https://i.pinimg.com/originals/be/8b/a4/be8ba4247220b4296c568a5b87f30892.gif','nature_plus'],
    ['https://i.pinimg.com/originals/41/48/03/414803605983332e92e9a9d937707bff.gif','nature++'],
]
const story_container = document.querySelector('.owl-carousel.items');
if (story_container) {
    for (let i = 0; i < image_profile.length; i++) {
        const parentDiv = document.createElement('div');
        parentDiv.classList.add("item_s");
        parentDiv.innerHTML = `
            <img src="${image_profile[i][0]}">
            <p>${image_profile[i][1]}</p>
        `;
        story_container.appendChild(parentDiv);
    }

    // Initialize the Owl Carousel after appending items
    $(story_container).owlCarousel({
        loop: true,
        margin: 5,
        responsiveClass: true,
        responsive: {
            0: {
                items: 5,
                nav: true
            },
            500: {
                items: 7,
                nav: false
            }
        }
    });
}
