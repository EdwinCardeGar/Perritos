-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: registro_perritos
-- ------------------------------------------------------
-- Server version	8.0.39

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
-- Table structure for table `colores`
--

DROP TABLE IF EXISTS `colores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colores` (
  `id_color` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_color`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colores`
--

LOCK TABLES `colores` WRITE;
/*!40000 ALTER TABLE `colores` DISABLE KEYS */;
INSERT INTO `colores` VALUES (1,'Negro',1),(2,'Blanco',1),(3,'Caf├®',1),(4,'Gris',1),(5,'Dorado',1),(6,'Crema',1),(7,'Canela',1),(8,'Atigrado',1),(9,'Manchado',1),(10,'Marr├│n',1),(11,'Beige',1),(12,'Rojizo',1);
/*!40000 ALTER TABLE `colores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `perrito_colores`
--

DROP TABLE IF EXISTS `perrito_colores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `perrito_colores` (
  `id_perrito` bigint NOT NULL,
  `id_color` int NOT NULL,
  PRIMARY KEY (`id_perrito`,`id_color`),
  KEY `idx_pc_color` (`id_color`),
  CONSTRAINT `fk_pc_color` FOREIGN KEY (`id_color`) REFERENCES `colores` (`id_color`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pc_perrito` FOREIGN KEY (`id_perrito`) REFERENCES `perritos` (`id_perrito`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perrito_colores`
--

LOCK TABLES `perrito_colores` WRITE;
/*!40000 ALTER TABLE `perrito_colores` DISABLE KEYS */;
INSERT INTO `perrito_colores` VALUES (6,1),(8,1),(15,1),(1,2),(3,2),(4,2),(2,3),(5,3),(10,3);
/*!40000 ALTER TABLE `perrito_colores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `perritos`
--

DROP TABLE IF EXISTS `perritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `perritos` (
  `id_perrito` bigint NOT NULL AUTO_INCREMENT,
  `id_raza` int DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `color_principal` int NOT NULL,
  `latitud` decimal(10,7) NOT NULL,
  `longitud` decimal(10,7) NOT NULL,
  `foto` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `clave_idempotencia` char(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (`id_perrito`),
  UNIQUE KEY `uq_clave_idempotencia` (`clave_idempotencia`),
  KEY `idx_perrito_raza` (`id_raza`),
  KEY `idx_perrito_color` (`color_principal`),
  KEY `idx_perrito_fecha` (`fecha_registro`),
  CONSTRAINT `fk_perrito_color_principal` FOREIGN KEY (`color_principal`) REFERENCES `colores` (`id_color`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_perrito_raza` FOREIGN KEY (`id_raza`) REFERENCES `razas` (`id_raza`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_latitud` CHECK ((`latitud` between -(90) and 90)),
  CONSTRAINT `chk_longitud` CHECK ((`longitud` between -(180) and 180)),
  CONSTRAINT `chk_nombre_no_vacio` CHECK ((char_length(trim(`nombre`)) > 0))
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `perritos`
--

LOCK TABLES `perritos` WRITE;
/*!40000 ALTER TABLE `perritos` DISABLE KEYS */;
INSERT INTO `perritos` VALUES (1,2,'Max','Perrito amigable de tama├▒o mediano',5,25.4380000,-100.9730000,'pruebas/max.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000001'),(2,4,'Luna','Perrita peque├▒a de color claro',6,25.4400000,-100.9750000,'pruebas/luna.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000002'),(3,3,'Rocky','Perrito de tama├▒o grande',1,25.4420000,-100.9770000,'pruebas/rocky.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000003'),(4,1,'Milo','Perrito criollo de color caf├®',3,25.4440000,-100.9790000,'pruebas/milo.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000004'),(5,8,'Toby','Perrito de color blanco y caf├®',2,25.4460000,-100.9810000,'pruebas/toby.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000005'),(6,7,'Nala','Perrita de pelaje gris',4,25.4480000,-100.9830000,'pruebas/nala.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000006'),(7,6,'Bobby','Perrito de pelaje dorado',5,25.4500000,-100.9850000,'pruebas/bobby.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000007'),(8,5,'Coco','Perrito de color blanco',2,25.4520000,-100.9870000,'pruebas/coco.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000008'),(9,9,'Bruno','Perrito de color atigrado',8,25.4540000,-100.9890000,'pruebas/bruno.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000009'),(10,10,'Pecas','Perrito blanco con manchas',9,25.4560000,-100.9910000,'pruebas/pecas.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000010'),(11,11,'Thor','Perrito de pelaje oscuro',1,25.4580000,-100.9930000,'pruebas/thor.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000011'),(12,12,'Lola','Perrita de color gris',4,25.4600000,-100.9950000,'pruebas/lola.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000012'),(13,1,'Simba','Perrito de color canela',7,25.4620000,-100.9970000,'pruebas/simba.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000013'),(14,4,'Chispa','Perrita de color rojizo',12,25.4640000,-100.9990000,'pruebas/chispa.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000014'),(15,2,'Oso','Perrito de color marr├│n',10,25.4660000,-101.0010000,'pruebas/oso.jpg','2026-09-26 22:21:56','10000000-0000-4000-8000-000000000015');
/*!40000 ALTER TABLE `perritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `razas`
--

DROP TABLE IF EXISTS `razas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `razas` (
  `id_raza` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_raza`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `razas`
--

LOCK TABLES `razas` WRITE;
/*!40000 ALTER TABLE `razas` DISABLE KEYS */;
INSERT INTO `razas` VALUES (1,'Sin raza definida / criollo',1),(2,'Labrador Retriever',1),(3,'Pastor Alem├ín',1),(4,'Chihuahua',1),(5,'Poodle',1),(6,'Golden Retriever',1),(7,'Husky Siberiano',1),(8,'Beagle',1),(9,'Boxer',1),(10,'D├ílmata',1),(11,'Rottweiler',1),(12,'Schnauzer',1);
/*!40000 ALTER TABLE `razas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-26 17:06:43
