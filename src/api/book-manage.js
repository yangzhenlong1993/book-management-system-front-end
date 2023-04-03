import request from '@/utils/request'

export default {
  getBookList(searchModel) {
    return request({
      url: '/book/list',
      method: 'get',
      params: {
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        bookName: searchModel.bookName,
        author: searchModel.author,
        publisher: searchModel.publisher
      }
    });
  },
  addBook(bookForm) {
    return request({
      url: '/book',
      method: 'post',
      data: bookForm
    });
  },
  getBookById(id) {
    return request({
      url: `/book/${id}`,
      method: 'get'
    });
  },
  saveBook(book) {
    if (book.id == null && book.id == undefined) {
      return this.addBook(book);
    }
    return this.updateBook(book);
  },
  updateBook(bookForm) {
    return request({
      url: '/book',
      method: 'put',
      data: bookForm
    });
  },
  deleteBookById(id) {
    return request({
      url: `/book/${id}`,
      method: 'delete'
    });
  }
}