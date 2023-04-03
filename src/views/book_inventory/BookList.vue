<template>
    <div>
        <!--search bar-->
        <el-card id="search_bar">
            <el-row>
                <el-col :span="20">
                    <el-input v-model="searchModel.bookName" placeholder="book name" clearable></el-input>
                    <el-input v-model="searchModel.author" placeholder="author" clearable></el-input>
                    <el-input v-model="searchModel.publisher" placeholder="publisher" clearable></el-input>
                    <el-button type="primary" @click="getBookList" round icon="el-icon-search">search</el-button>
                </el-col>
                <el-col :span="4" align="right">
                    <el-button type="primary" icon="el-icon-plus" circle @click="openFormDialog(null)"></el-button>
                </el-col>
            </el-row>
        </el-card>

        <!--search result-->
        <el-card>
            <el-table :data="bookList" style="width: 100%">
                <el-table-column label="#" width="80">
                    <template slot-scope="scope">
                        <!--(pageNo-1)*pageSize + index + 1-->
                        {{ (searchModel.pageNo - 1) * searchModel.pageSize + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="id" label="book id" width="180">
                </el-table-column>
                <el-table-column prop="bookName" label="name" width="180">
                </el-table-column>
                <el-table-column prop="author" label="author" width="180">
                </el-table-column>
                <el-table-column prop="publisher" label="publisher" width="180">
                </el-table-column>
                <!-- <el-table-column prop="inStock" label="in stock">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.inStock == 1">in stock</el-tag>
                        <el-tag v-else type="danger">out of stock</el-tag>
                    </template>
                </el-table-column> -->
                <el-table-column prop="description" label="description">
                </el-table-column>
                <el-table-column label="operation" width="180">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" circle @click="openFormDialog(scope.row.id)"
                            size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" circle size="mini"
                            @click="deleteBook(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!--pagination bar-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="searchModel.pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="searchModel.pageSize"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
        <!--dialog-->
        <el-dialog @close="clearForm" :title="title" :visible.sync="dialogFormVisible">
            <el-form :model="bookForm" ref="bookFormRef" :rules="rules">
                <el-form-item label="book name" :label-width="formLabelWidth" prop="bookName">
                    <el-input v-model="bookForm.bookName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="author" :label-width="formLabelWidth" prop="author">
                    <el-input v-model="bookForm.author" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="publisher" :label-width="formLabelWidth" prop="publisher">
                    <el-input v-model="bookForm.publisher" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="publication date" :label-width="formLabelWidth" prop="publicationDate">
                    <el-date-picker v-model="bookForm.publicationDate" type="date" placeholder="select date">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="cover image" :label-width="formLabelWidth" prop="coverImage">
                    <single-upload v-model="bookForm.coverImage"></single-upload>
                </el-form-item>
                <!-- <el-form-item label="status" :label-width="formLabelWidth">
                    <el-switch v-model="userForm.status" :active-value="1" :inactive-value="0">
                    </el-switch>
                </el-form-item> -->
                <!-- <el-form-item label="role" :label-width="formLabelWidth">
                    <el-checkbox-group style="width: 85%" v-model="userForm.roleIdList" :max="2">
                        <el-checkbox v-for="role in roleList" :label="role.roleId" :key="role.roleId">{{ role.roleDesc
                        }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item> -->
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">cancel</el-button>
                <el-button type="primary" @click="saveBook">confirm</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import SingleUpload from '@/components/Upload/singleUpload'
import bookManageApi from '@/api/book-manage'


export default {
    components: { SingleUpload },
    data() {
        var checkEmail = (rule, value, callback) => {
            var reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!reg.test(value)) {
                return callback(new Error('email format is not correct'));
            }
            callback();
        };
        return {
            formLabelWidth: '130px',
            bookForm: {

            },
            dialogFormVisible: false,
            title: "",
            total: 0,
            searchModel: {
                pageNo: 1,
                pageSize: 10
            },
            bookList: [],
            rules: {
                bookName: [
                    { required: true, message: 'please enter book name', trigger: 'blur' },
                    { min: 3, max: 50, message: 'the length should be from 3 to 50', trigger: 'blur' }
                ],
                author: [
                    { required: true, message: 'please enter author', trigger: 'blur' },
                    { min: 6, max: 16, message: 'the length should be from 6 to 16', trigger: 'blur' }
                ],
                publisher: [
                    { required: true, message: 'please enter publisher', trigger: 'blur' }
                    //  { validator: checkEmail, trigger: 'blur' }
                ],
            }
        }
    },
    methods: {
        saveBook() {
            //triger the form validator first
            this.$refs.bookFormRef.validate((valid) => {
                if (valid) {
                    //validation passed, submit the info to the server
                    bookManageApi.saveBook(this.bookForm).then(response => {
                        //submition success notification
                        this.$message({
                            message: response.message,
                            type: 'success'
                        });
                        //close dialog form
                        this.dialogFormVisible = false;
                        //refresh the data list
                        this.getBookList();
                    });
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });

        },
        openFormDialog(id) {
            if (id == null) {
                this.title = 'Create a new book';

            } else {
                this.title = 'update the book';
                //select the selected user info by user id
                bookManageApi.getBookById(id).then(response => {
                    this.bookForm = response.data;
                });
            }
            this.dialogFormVisible = true;
        },
        handleSizeChange(pageSize) {
            this.searchModel.pageSize = pageSize;
            this.getBookList();
        },
        handleCurrentChange(pageNo) {
            this.searchModel.pageNo = pageNo;
            this.getBookList();
        },
        getBookList() {
            bookManageApi.getBookList(this.searchModel).then(resp => {
                this.bookList = resp.data.rows;
                this.total = resp.data.total;
            });
        },
        clearForm() {
            this.bookForm = {
            };
            this.$refs.bookFormRef.clearValidate();
        },
        deleteBook(book) {
            //confirmation message box
            this.$confirm(`Do you confirm the deletion of ${book.bookName}?`, 'warning', {
                confirmButtonText: 'confirm',
                cancelButtonText: 'cancel',
                type: 'warning'
            }).then(() => {
                bookManageApi.deleteBookById(book.id).then(response => {
                    this.$message({
                        type: 'success',
                        message: response.message
                    });
                    this.getBookList();
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: 'cancel the deletion'
                });
            });
        }
        // getAllRoleList() {
        //     roleManageApi.getAllRoleList().then(response => {
        //         this.roleList = response.data;
        //         console.log(this.roleList);
        //     });
        // }
    },
    created() {
        this.getBookList();
    }
}
</script>

<style>
#search_bar .el-input {
    width: 200px;
    margin-right: 10px;
}

.el-dialog .el-input {
    width: 85%;
}
</style>