import debounce from './debounce.js'

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide)
    this.wrapper = document.querySelector(wrapper)
    this.dist = {finalPosition: 0, startX: 0, movement: 0 }
    this.activeClass = 'active';
    this.changeEvent = new Event('changeEvent');
  }

  transiton(active) {
    this.slide.style.transiton = active ? 'transform .3s' : '';
  }

  moveSlide(distX) {
    this.dist.movePosition = distX
    this.slide.style.transform =`translate3d(${distX}px, 0, 0)`;
  }

  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement
  }

  onStart(event) {
    let movetype
    if (event.type === 'mousedown') {
      event.preventDefault();
      this.dist.startX = event.clientX;
      movetype = 'mousemove'
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      movetype = 'touchmove';
    }
    this.wrapper.addEventListener(movetype, this.onMove);
    this.transiton(false);
  }

  onMove(event) {
    const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition)
  }

  onEnd(event) {
    const movetype = (event.type === 'mouseup') ? 'mousemove': 'touchmove'
    this.wrapper.removeEventListener(movetype, this.onMove)
    this.dist.finalPosition = this.dist.movePosition
    this.transiton(true);
    this.chengeSlideOnEnd();
  }

  chengeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.next !== undefined) {
      this.activePrevSlide()
    } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
      this.activeNextSlide()
    } else {
      this.chengeSlide(this.index.active)
    }
  }

  addSlideEvents() {
    this.wrapper.addEventListener('mousedown', this.onStart)
    this.wrapper.addEventListener('touchstart', this.onStart)
    this.wrapper.addEventListener('mouseup', this.onEnd)
    this.wrapper.addEventListener('touchend', this.onEnd)
  }

 

  // slides config

  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return {position, element}
    });
  }

  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;

    this.index = {
      prev: index ? index - 1 : undefined, 
      active: index,
      next: index == last ? undefined : index + 1,

    }
  }

  chengeSlide(index) {
    const activeSlide = this.slideArray[index]
    this.moveSlide(this.slideArray[index].position)
    this.slidesIndexNav(index);
    this.dist.finalPosition = activeSlide.position
    console.log(this.index)
    this.chengeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent)
  }

  chengeActiveClass() {
    this.slideArray.forEach( item => item.element.classList.remove(this.activeClass))
    this.slideArray[this.index.active].element.classList.add(this.activeClass)
  }

  activePrevSlide() {
    if (this.index.next !== undefined) {
      this.chengeSlide(this.index.next)
    }
  }

  activeNextSlide() {
    if (this.index.prev !== undefined) {
      this.chengeSlide(this.index.prev)
    }
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
    this.chengeSlide(this.index.active);
    }, 1000)

  }

  addResizeEvent() {
    window.addEventListener('resize', this.onResize);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this)

    this.onResize = debounce(this.onResize.bind(this), 200);
  }

  init(){
    this.slidesConfig();
    this.transiton(true)
    this.bindEvents();
    this.addSlideEvents();
    this.slidesConfig();
    this.addResizeEvent();
    this.chengeSlide(0)
    return this
  }
}

export class SlideNav extends Slide {
  constructor(slide, wrapper) {
    super(slide, wrapper)
    this.bindControlEvents()
  }
  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev)
    this.nextElement = document.querySelector(next)
    this.addArrowEvent()
  }

  addArrowEvent() {
    this.prevElement.addEventListener('click', this.activeNextSlide)
    this.nextElement.addEventListener('click', this.activePrevSlide)
  }

  createControl() {
    const control = document.createElement('ul');
    control.dataset.control = 'slide'

    this.slideArray.forEach((item, index) =>{
      control.innerHTML += `<li><a href="#slide${index + 1}">${index}</a></li>`
    })
    this.wrapper.appendChild(control)
    return control;
  }

  eventControl(item, index) {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      this.chengeSlide(index);
    })
    this.wrapper.addEventListener('chengeEvent', this.activeControlItem)
  }

  activeControlItem() {
    this.controlArray.forEach(item => item.classList.remove(this.activeClass))
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  addControl(customControl) {
    this.control = document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];

    this.controlArray.forEach(this.eventControl)

    console.log(this.control)
  }

  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this)
    this.activeControlItem = this.activeControlItem.bind(this)
  }

}