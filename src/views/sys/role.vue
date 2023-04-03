<template>
    <div>
        <!--search bar-->
        <el-card id="search_bar">
            <el-row>
                <el-col :span="20">
                    <el-input v-model="searchModel.roleName" placeholder="roleName" clearable></el-input>
                    <el-button type="primary" @click="getRoleList" round icon="el-icon-search">search</el-button>
                </el-col>
                <el-col :span="4" align="right">
                    <el-button type="primary" icon="el-icon-plus" circle @click="openFormDialog(null)"></el-button>
                </el-col>
            </el-row>
        </el-card>

        <!--search result-->
        <el-card>
            <el-table :data="roleList" style="width: 100%">
                <el-table-column label="#" width="80">
                    <template slot-scope="scope">
                        <!--(pageNo-1)*pageSize + index + 1-->
                        {{ (searchModel.pageNo - 1) * searchModel.pageSize + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column prop="roleId" label="role id" width="200">
                </el-table-column>
                <el-table-column prop="roleName" label="role name" width="260">
                </el-table-column>
                <el-table-column prop="roleDesc" label="role description">
                </el-table-column>
                <el-table-column label="operation" width="180">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" circle @click="openFormDialog(scope.row.roleId)"
                            size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" circle size="mini"
                            @click="deleteRole(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!--pagination bar-->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="searchModel.pageNo" :page-sizes="[5, 10, 15, 20]" :page-size="searchModel.pageSize"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
        <!--role form dialog-->
        <el-dialog @close="clearForm" :title="title" :visible.sync="dialogFormVisible">
            <el-form :model="roleForm" ref="roleFormRef" :rules="rules">
                <el-form-item label="role name" :label-width="formLabelWidth" prop="roleName">
                    <el-input v-model="roleForm.roleName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="role description" :label-width="formLabelWidth" prop="roleDesc">
                    <el-input v-model="roleForm.roleDesc" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="role permissions" :label-width="formLabelWidth" prop="menuIdList">
                    <el-tree ref="menuRef" :props="menuProps" node-key="menuId" :data="menuList" show-checkbox style="width: 85%;" default-expand-all>
                    </el-tree>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">cancel</el-button>
                <el-button type="primary" @click="saveRole">confirm</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import roleManageApi from '@/api/role-manage'
import menuManageApi from '@/api/menu-manage'
export default {
    data() {
        return {
            menuList: [

            ],
            menuProps: {
                children: 'children',
                label: 'title'
            },
            formLabelWidth: '130px',
            roleForm: {},
            dialogFormVisible: false,
            title: "",
            total: 0,
            searchModel: {
                pageNo: 1,
                pageSize: 10
            },
            roleList: [],
            rules: {
                roleName: [
                    { required: true, message: 'please enter role name', trigger: 'blur' },
                    { min: 2, max: 20, message: 'the length should be from 2 to 20', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: 'please enter role description', trigger: 'blur' },
                    { min: 2, max: 50, message: 'the length should be from 2 to 50', trigger: 'blur' }
                ],
            }
        }
    },
    methods: {
        saveRole() {
            //triger the form validator first
            this.$refs.roleFormRef.validate((valid) => {
                if (valid) {
                    let checkedKeys = this.$refs.menuRef.getCheckedKeys();
                    let halfCheckedKeys = this.$refs.menuRef.getHalfCheckedKeys();
                    this.roleForm.menuIdList = checkedKeys.concat(halfCheckedKeys);
                    //validation passed, submit the info to the server
                    roleManageApi.saveRole(this.roleForm).then(response => {
                        //submition success notification
                        this.$message({
                            message: response.message,
                            type: 'success'
                        });
                        //close dialog form
                        this.dialogFormVisible = false;
                        //refresh the data list
                        this.getRoleList();
                    });
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });

        },
        openFormDialog(id) {
            if (id == null) {
                this.title = 'Create a new role';

            } else {
                this.title = 'update the role info';
                //select the selected user info by user id
                roleManageApi.getRoleById(id).then(response => {
                    this.roleForm = response.data;
                    this.$refs.menuRef.setCheckedKeys(response.data.menuIdList);
                });
            }
            this.dialogFormVisible = true;
        },
        handleSizeChange(pageSize) {
            this.searchModel.pageSize = pageSize;
            this.getRoleList();
        },
        handleCurrentChange(pageNo) {
            this.searchModel.pageNo = pageNo;
            this.getRoleList();
        },
        getRoleList() {
            roleManageApi.getRoleList(this.searchModel).then(resp => {
                this.roleList = resp.data.rows;
                this.total = resp.data.total;
            });
        },
        clearForm() {
            this.roleForm = {};
            this.$refs.roleFormRef.clearValidate();
            this.$refs.menuRef.setCheckedKeys([]);
        },
        deleteRole(role) {
            //confirmation message box
            this.$confirm(`Do you confirm the deletion of ${role.roleName}?`, 'warning', {
                confirmButtonText: 'confirm',
                cancelButtonText: 'cancel',
                type: 'warning'
            }).then(() => {
                roleManageApi.deleteRoleById(role.roleId).then(response => {
                    this.$message({
                        type: 'success',
                        message: response.message
                    });
                    this.getRoleList();
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: 'cancel the deletion'
                });
            });
        },
        getAllMenu(){
            menuManageApi.getAllMenu().then(response=>{
                this.menuList = response.data;
            })
        }
    },
    created() {
        this.getRoleList();
        this.getAllMenu();
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