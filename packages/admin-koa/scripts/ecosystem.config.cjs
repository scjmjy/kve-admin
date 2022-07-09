module.exports = {
    apps: [
        {
            name: "kve-admin",
            exec_mode: "cluster",
            instances: "max",
            script: "./dist/js/index.js",
            node_args: "--experimental-specifier-resolution=node",
            env_production: {
                NODE_ENV: "production",
            },
            env_development: {
                NODE_ENV: "development",
            },
        },
    ],

    // deploy : {
    //   production : {
    //     user : 'SSH_USERNAME',
    //     host : 'SSH_HOSTMACHINE',
    //     ref  : 'origin/master',
    //     repo : 'GIT_REPOSITORY',
    //     path : 'DESTINATION_PATH',
    //     'pre-deploy-local': '',
    //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
    //     'pre-setup': ''
    //   }
    // }
};
