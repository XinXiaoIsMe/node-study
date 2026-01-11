-- CreateTable
CREATE TABLE `tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(120) NOT NULL,
    `description` VARCHAR(191) NULL,
    `start_date` DATETIME(3) NULL,
    `due_date` DATETIME(3) NULL,
    `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    `status` ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
    `created_by` INTEGER NOT NULL,
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_time` DATETIME(3) NOT NULL,

    INDEX `idx_tasks_creator`(`created_by`),
    INDEX `idx_tasks_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL,
    `nickname` VARCHAR(32) NULL,
    `gender` TINYINT NULL DEFAULT 1,
    `password` VARCHAR(255) NOT NULL,
    `avatar` LONGBLOB NULL,
    `avatar_mime` VARCHAR(64) NULL,
    `avatar_size` INTEGER UNSIGNED NULL,
    `self_intro` VARCHAR(255) NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `create_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_time` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
