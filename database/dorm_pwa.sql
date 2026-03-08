-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 19, 2025 at 06:16 AM
-- Server version: 8.0.42
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dorm_pwa`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int NOT NULL,
  `title` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_general_ci,
  `posted_by` int DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `posted_by`, `posted_at`) VALUES
(1, 'แจ้งปิดห้องน้ำชั่วคราว', 'ห้องน้ำชั้น 2 จะปิดปรับปรุงวันที่ 20-22 มิถุนายน', 1, '2025-06-16 07:39:35'),
(2, 'ตรวจระบบ คีย์การ์ด', 'ตรวจระบบ คีย์การ์ด', 1, '2025-06-17 10:11:52');

-- --------------------------------------------------------

--
-- Table structure for table `checkins`
--

CREATE TABLE `checkins` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `facility_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `checkin_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `facility_bookings`
--

CREATE TABLE `facility_bookings` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `facility_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `number_of_people` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `time_slot_start` time NOT NULL,
  `time_slot_end` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `facility_bookings`
--

INSERT INTO `facility_bookings` (`id`, `user_id`, `facility_name`, `booking_date`, `number_of_people`, `created_at`, `time_slot_start`, `time_slot_end`) VALUES
(1, 1, 'ห้องประชุม', '2025-06-17', 3, '2025-06-16 07:35:15', '00:00:00', '00:00:00'),
(2, 1, NULL, NULL, NULL, '2025-06-16 12:17:29', '00:00:00', '00:00:00'),
(3, 1, 'สระว่ายน้ำ', '2025-06-18', 1, '2025-06-17 02:14:17', '00:00:00', '00:00:00'),
(4, 1, 'ห้องประชุม', '2025-06-17', 1, '2025-06-17 02:49:27', '10:00:00', '11:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `water_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `electricity_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `common_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `room_rent` decimal(10,2) NOT NULL DEFAULT '0.00',
  `month_year` char(7) NOT NULL,
  `paid` tinyint(1) NOT NULL DEFAULT '0',
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `user_id`, `water_fee`, `electricity_fee`, `common_fee`, `room_rent`, `month_year`, `paid`, `paid_at`, `created_at`) VALUES
(6, 1, 200.00, 300.00, 400.00, 500.00, '1010', 0, NULL, '2025-06-19 03:28:19');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_extras`
--

CREATE TABLE `invoice_extras` (
  `id` int NOT NULL,
  `invoice_id` int NOT NULL,
  `label` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `parcels`
--

CREATE TABLE `parcels` (
  `id` int NOT NULL,
  `room_number` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `received_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `picked_up` tinyint(1) DEFAULT '0',
  `picked_up_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parcels`
--

INSERT INTO `parcels` (`id`, `room_number`, `description`, `received_at`, `picked_up`, `picked_up_at`) VALUES
(2, 'B101', 'กล่องจาก Shopee', '2025-06-16 07:18:42', 1, '2025-06-18 05:27:13'),
(3, 'A101', 'กล่องจาก Shopee', '2025-06-16 07:19:58', 0, NULL),
(4, 'A101', 'Shopee', '2025-06-17 07:45:50', 0, NULL),
(5, 'A101', 'จากเคอรี่', '2025-06-17 11:20:57', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `qr_checkins`
--

CREATE TABLE `qr_checkins` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `room_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `checkin_time` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `qr_checkins`
--

INSERT INTO `qr_checkins` (`id`, `user_id`, `room_number`, `checkin_time`, `created_at`) VALUES
(1, 1, 'B101', '2025-06-17 05:10:34', '2025-06-17 05:10:34'),
(2, 2, 'A101', '2025-06-18 05:25:14', '2025-06-18 05:25:14'),
(3, 2, 'B101', '2025-06-18 05:25:29', '2025-06-18 05:25:29');

-- --------------------------------------------------------

--
-- Table structure for table `repair_requests`
--

CREATE TABLE `repair_requests` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `title` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `room_number` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('pending','in_progress','completed') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `repair_requests`
--

INSERT INTO `repair_requests` (`id`, `user_id`, `title`, `description`, `room_number`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'เก้าอี้หัก', 'ขาเก้าอี้หักตรงมุมโต๊ะ', 'B101', 'pending', '2025-06-16 07:13:11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `fullname` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `room_number` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('resident','admin') COLLATE utf8mb4_general_ci DEFAULT 'resident',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `line_user_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `fullname`, `room_number`, `role`, `created_at`, `line_user_id`) VALUES
(1, 'admin', '$2a$12$hO2T2QIsswU4HjGfcnxMGu1pZHFTUI1z33OTZOfm6ysrjj0qGf.pO', 'Admin User', 'A101', 'admin', '2025-06-16 06:26:44', 'U17fea15974d6895f1a185502bdba759f'),
(2, 'user01', '$2a$12$d.YCcWKqIulkuU9rnHrK3u7xd00eiDFTgyDZslai8wat4dOFJ4ruO', 'User One', 'B101', 'resident', '2025-06-16 06:44:13', NULL),
(3, 'C101', '$2b$10$WFpURCFW9GnORMMo3lUPHOpBo.oQa1Ocpn9FrWyHLLCcXz.rfvU.a', 'narongsa peng', 'C101', 'resident', '2025-06-18 04:24:07', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `posted_by` (`posted_by`);

--
-- Indexes for table `checkins`
--
ALTER TABLE `checkins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `facility_bookings`
--
ALTER TABLE `facility_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `invoice_extras`
--
ALTER TABLE `invoice_extras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `parcels`
--
ALTER TABLE `parcels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `qr_checkins`
--
ALTER TABLE `qr_checkins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `repair_requests`
--
ALTER TABLE `repair_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `checkins`
--
ALTER TABLE `checkins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facility_bookings`
--
ALTER TABLE `facility_bookings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `invoice_extras`
--
ALTER TABLE `invoice_extras`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `parcels`
--
ALTER TABLE `parcels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `qr_checkins`
--
ALTER TABLE `qr_checkins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `repair_requests`
--
ALTER TABLE `repair_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `checkins`
--
ALTER TABLE `checkins`
  ADD CONSTRAINT `checkins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `facility_bookings`
--
ALTER TABLE `facility_bookings`
  ADD CONSTRAINT `facility_bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `invoice_extras`
--
ALTER TABLE `invoice_extras`
  ADD CONSTRAINT `invoice_extras_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `repair_requests`
--
ALTER TABLE `repair_requests`
  ADD CONSTRAINT `repair_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
