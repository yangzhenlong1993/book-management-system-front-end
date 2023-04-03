<template>
    <div>
        <!--search bar-->
        <el-card id="search_bar">
            <el-row>
                <el-col :span="20">
                    <el-input v-model="searchModel.username" placeholder="username" clearable></el-input>
                    <el-input v-model="searchModel.phone" placeholder="phone" clearable></el-input>
                    <el-button type="primary" @click="getUserList" round icon="el-icon-search">search</el-button>
                </el-col>
                <el-col :span="4" align="right">
                    <el-button type="primary" icon="el-icon-plus" circle @click="openFormDialog(null)"></el-button>
                </el-col>
            </el-row>
        </el-card>

        <!--search result-->
        <el-card>
            <el-table :data="userList" style="width: 100%">
                <el-table-column label="#" width="80">
                    <template slot-scope="scope">
                        <!--(pageNo-1)*pageSize + index + 1-->
                        {{ (searchModel.pageNo - 1) * searchModel.pageSize + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="id" label="user id" width="180">
                </el-table-column>
                <el-table-column prop="username" label="username" width="180">
                </el-table-column>
                <el-table-column prop="phone" label="phone" width="180">
                </el-table-column>
                <el-table-column prop="status" label="status" width="180">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status == 1">normal</el-tag>
                        <el-tag v-else type="danger">forbidden</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="email">
                </el-table-column>
                <el-table-column label="operation" width="180">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" circle @click="openFormDialog(scope.row.id)"
                            size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" circle size="mini"
                            @click="deleteUser(scope.row)"></el-button>
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
            <el-form :model="userForm" ref="userFormRef" :rules="rules">
                <el-form-item label="username" :label-width="formLabelWidth" prop="username">
                    <el-input v-model="userForm.username" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="password" :label-width="formLabelWidth" prop="password"
                    v-if="userForm.id == null || userForm.id == undefined">
                    <el-input type="password" v-model="userForm.password" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="phone" :label-width="formLabelWidth">
                    <el-input v-model="userForm.phone" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="email" :label-width="formLabelWidth" prop="email">
                    <el-input v-model="userForm.email" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="avatar" :label-width="formLabelWidth" prop="avatar">
                    <single-upload v-model="userForm.avatar"></single-upload>
                </el-form-item>
                <el-form-item label="status" :label-width="formLabelWidth">
                    <el-switch v-model="userForm.status" :active-value="1" :inactive-value="0">
                    </el-switch>
                </el-form-item>
                <el-form-item label="role" :label-width="formLabelWidth">
                    <el-checkbox-group style="width: 85%" v-model="userForm.roleIdList" :max="2">
                        <el-checkbox v-for="role in roleList" :label="role.roleId" :key="role.roleId">{{ role.roleDesc
                        }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">cancel</el-button>
                <el-button type="primary" @click="saveUser">confirm</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import SingleUpload from '@/components/Upload/singleUpload'
import userManageApi from '@/api/user-manage'
import roleManageApi from '@/api/role-manage'

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
            roleList: [],
            formLabelWidth: '130px',
            userForm: {
                roleIdList: []
            },
            dialogFormVisible: false,
            title: "",
            total: 0,
            searchModel: {
                pageNo: 1,
                pageSize: 10
            },
            userList: [],
            rules: {
                username: [
                    { required: true, message: 'please enter username', trigger: 'blur' },
                    { min: 3, max: 50, message: 'the length should be from 3 to 50', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: 'please enter password', trigger: 'blur' },
                    { min: 6, max: 16, message: 'the length should be from 6 to 16', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: 'please enter email', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
            }
        }
    },
    methods: {
        saveUser() {
            //triger the form validator first
            this.$refs.userFormRef.validate((valid) => {
                if (valid) {
                    //validation passed, submit the info to the server
                    userManageApi.saveUser(this.userForm).then(response => {
                        //submition success notification
                        this.$message({
                            message: response.message,
                            type: 'success'
                        });
                        //close dialog form
                        this.dialogFormVisible = false;
                        //refresh the data list
                        this.getUserList();
                    });
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });

        },
        openFormDialog(id) {
            if (id == null) {
                this.title = 'Create a new user';

            } else {
                this.title = 'update the user';
                //select the selected user info by user id
                userManageApi.getUserById(id).then(response => {
                    this.userForm = response.data;
                });
            }
            this.dialogFormVisible = true;
        },
        handleSizeChange(pageSize) {
            this.searchModel.pageSize = pageSize;
            this.getUserList();
        },
        handleCurrentChange(pageNo) {
            this.searchModel.pageNo = pageNo;
            this.getUserList();
        },
        getUserList() {
            userManageApi.getUserList(this.searchModel).then(resp => {
                this.userList = resp.data.rows;
                this.total = resp.data.total;
            });
        },
        clearForm() {
            this.userForm = {
                roleIdList: []
            };
            this.$refs.userFormRef.clearValidate();
        },
        deleteUser(user) {
            //confirmation message box
            this.$confirm(`Do you confirm the deletion of ${user.username}?`, 'warning', {
                confirmButtonText: 'confirm',
                cancelButtonText: 'cancel',
                type: 'warning'
            }).then(() => {
                userManageApi.deleteUserById(user.id).then(response => {
                    this.$message({
                        type: 'success',
                        message: response.message
                    });
                    this.getUserList();
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: 'cancel the deletion'
                });
            });
        },
        getAllRoleList() {
            roleManageApi.getAllRoleList().then(response => {
                this.roleList = response.data;
                console.log(this.roleList);
            });
        }
    },
    created() {
        this.getUserList();
        this.getAllRoleList();
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