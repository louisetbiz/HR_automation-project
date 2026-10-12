-- MySQL dump 10.13  Distrib 9.3.0, for macos15 (arm64)
--
-- Host: localhost    Database: hr_project
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `shift_types`
--

LOCK TABLES `shift_types` WRITE;
/*!40000 ALTER TABLE `shift_types` DISABLE KEYS */;
INSERT INTO `shift_types` VALUES (1,'Opening Kitchen','08:00:00','16:00:00','Kitchen'),(2,'Closing Kitchen','09:00:00','17:00:00','Kitchen'),(3,'Closing Kitchen Weeked','09:30:00','17:30:00','Kitchen'),(4,'Opening Bar','08:15:00','15:15:00','Waiter'),(5,'Opening Bar Weekend','08:30:00','15:30:00','Waiter'),(6,'Opening Salon','09:00:00','16:00:00','Waiter'),(7,'Opening Salon Weekend','09:30:00','16:30:00','Waiter'),(8,'Middle Salon Weekend1','10:00:00','18:30:00','Waiter'),(9,'Middle Salon Weekend2','10:30:00','18:30:00','Waiter'),(10,'Closing Salon','10:00:00','18:30:00','Waiter'),(11,'Closing Salon Weekend','11:00:00','18:30:00','Waiter');
/*!40000 ALTER TABLE `shift_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-12 14:29:52
