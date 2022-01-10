import './sass/main.scss';

import Notiflix from 'notiflix';
import counterCard from '../src/templates/counterCard.hbs';
import NewApiService from './new-server';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formRef = document.querySelector('#search-form');
const cardsGalleryRef = document.querySelector('.gallery');
const buttonLoadMoreRef = document.querySelector('.load-more');

const newApiService = new NewApiService();

formRef.addEventListener('submit', onSearch);
buttonLoadMoreRef.addEventListener('click', onLoadMore);

function onSearch(e) {
  e.preventDefault();

  newApiService.query = e.currentTarget.elements.searchQuery.value.trim();

  newApiService.resetPage();

  clearHitsMarkup();
  newApiService.fetchArticles().then(data => {
    if (!data.hits.length || newApiService.query === '') {
      buttonLoadMoreRef.classList.add('is-hidden');
      clearHitsMarkup();
      onFetchError();

      return;
    }
    appendHitsMarkup(data);
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  });
}

function onLoadMore() {
  newApiService.fetchArticles().then(scrollRender);
}

function appendHitsMarkup(data) {
  buttonLoadMoreRef.classList.remove('is-hidden');
  cardsGalleryRef.insertAdjacentHTML('beforeend', counterCard(data.hits));

  const lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
    captionsData: 'alt',
  });
}

function scrollRender(data) {
  cardsGalleryRef.insertAdjacentHTML('beforeend', counterCard(data.hits));
  buttonLoadMoreRef.classList.remove('is-hidden');
  const lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
    captionsData: 'alt',
  });

  if (data.hits.length < 40 && data.hits.length >= 0) {
    buttonLoadMoreRef.classList.add('is-hidden');
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
  }
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
  lightbox.refresh();
}

function clearHitsMarkup() {
  cardsGalleryRef.innerHTML = '';
  buttonLoadMoreRef.classList.add('is-hidden');
}

function onFetchError(error) {
  buttonLoadMoreRef.classList.add('is-hidden');
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
  );
}
