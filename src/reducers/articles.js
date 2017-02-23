/**
 * Created by li on 22/02/2017.
 */

export default function articles(state = 0, action) {

  switch (action.type) {
    case 'FETCH_ARTICLES':
      return state + 20;
    case 'POPULATE_ARTICLES':
      return state + 20;
    default:
      return state;
  }
}
