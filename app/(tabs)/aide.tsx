import DashboardShell from "@/components/dashboard-shell";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Colors } from "../../constants/colors";

export default function AideScreen() {
  const router = useRouter();
  const [isDarkMode] = useState(false); // This would normally come from a store
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Navigation & back handler
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (Platform.OS === "android") {
          router.replace("/(tabs)/configuration");
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, [router]),
  );

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)/configuration");
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.primary }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const FeatureItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <View style={[styles.featureItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.featureIcon, { backgroundColor: theme.primary + "15" }]}>
        <Ionicons name={icon as any} size={24} color={theme.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );

  const SettingItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <View style={[styles.settingItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: theme.primary + "15" }]}>
        <Ionicons name={icon as any} size={20} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );

  return (
    <DashboardShell
      title="Aide & Documentation"
      subtitle="Guide d'utilisation de l'application"
      icon="help-circle-outline"
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <Section title="Bienvenue dans E-PAOSY">
          <Text style={[styles.introText, { color: theme.text }]}>
            E-PAOSY est une application de gestion de finances personnelles conçue pour vous aider à suivre vos dépenses, 
            gérer vos projets et atteindre vos objectifs financiers. Cette application vous permet de garder un contrôle 
            total sur vos finances de manière simple et intuitive.
          </Text>
        </Section>

        {/* Fonctionnalités principales */}
        <Section title="Fonctionnalités Principales">
          <FeatureItem
            icon="wallet-outline"
            title="Gestion des Portefeuilles"
            description="Créez et gérez plusieurs portefeuilles avec différents soldes. Chaque portefeuille peut représenter un compte bancaire, une tirelire, ou tout autre endroit où vous conservez de l'argent."
          />
          
          <FeatureItem
            icon="receipt-outline"
            title="Gestion des Transactions"
            description="Enregistrez toutes vos entrées et sorties d'argent. Les transactions peuvent être catégorisées avec des libellés pour un suivi plus précis de vos dépenses."
          />
          
          <FeatureItem
            icon="folder-outline"
            title="Gestion de Projets"
            description="Créez des projets avec des objectifs financiers spécifiques. Suivez les transactions associées à chaque projet et voyez votre progression en temps réel."
          />
          
          <FeatureItem
            icon="flag-outline"
            title="Objectifs Financiers"
            description="Définissez des objectifs d'épargne avec des montants cibles et des dates d'échéance. L'application vous aidera à suivre votre progression et à rester motivé."
          />
          
          <FeatureItem
            icon="calendar-outline"
            title="Calendrier des Dépenses"
            description="Visualisez vos dépenses sur un calendrier pour identifier les tendances et mieux planifier vos finances."
          />
        </Section>

        {/* Interface utilisateur */}
        <Section title="Interface Utilisateur">
          <Text style={[styles.sectionText, { color: theme.text }]}>
            L&apos;application utilise une interface moderne avec un système d&apos;onglets pour accéder aux différentes fonctionnalités :
          </Text>
          
          <View style={styles.tabsContainer}>
            <SettingItem
              icon="bar-chart-outline"
              title="Tableau de Bord"
              description="Vue d'ensemble de vos finances avec des statistiques clés et des graphiques."
            />
            <SettingItem
              icon="calendar-outline"
              title="Calendrier"
              description="Visualisation chronologique de vos transactions et dépenses."
            />
            <SettingItem
              icon="wallet-outline"
              title="Portefeuille"
              description="Gestion de vos différents comptes et soldes."
            />
            <SettingItem
              icon="folder-outline"
              title="Projets"
              description="Suivi des projets financiers et de leurs transactions associées."
            />
            <SettingItem
              icon="flag-outline"
              title="Objectifs"
              description="Visualisation et gestion de vos objectifs d'épargne."
            />
            <SettingItem
              icon="receipt-outline"
              title="Transactions"
              description="Liste détaillée de toutes vos transactions."
            />
            <SettingItem
              icon="pricetag-outline"
              title="Libellés"
              description="Catégorisation de vos transactions pour un meilleur suivi."
            />
            <SettingItem
              icon="options-outline"
              title="Configuration"
              description="Paramètres de l'application, notifications et abonnement."
            />
          </View>
        </Section>

        {/* Abonnement Premium */}
        <Section title="Abonnement Premium">
          <Text style={[styles.sectionText, { color: theme.text }]}>
            L&apos;application propose un abonnement premium qui débloque des fonctionnalités avancées :
          </Text>
          
          <FeatureItem
            icon="diamond-outline"
            title="Fonctionnalités Premium"
            description="Accès à des rapports détaillés, des analyses avancées, et des options de personnalisation supplémentaires."
          />
          
          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            Pour activer le statut premium, rendez-vous dans la section Configuration {">"} Abonnement et authentifiez-vous avec vos identifiants.
          </Text>
        </Section>

        {/* Sécurité */}
        <Section title="Sécurité">
          <FeatureItem
            icon="key-outline"
            title="Authentification"
            description="L'application utilise un système d'authentification sécurisé pour protéger vos données financières."
          />
          
          <FeatureItem
            icon="finger-print-outline"
            title="Empreinte Digitale"
            description="Activez la reconnaissance d'empreinte digitale pour un accès rapide et sécurisé à votre application."
          />
          
          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            Vos données sont stockées localement sur votre appareil et ne sont pas transmises à des serveurs externes.
          </Text>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <Text style={[styles.sectionText, { color: theme.text }]}>
            Configurez les notifications pour rester informé de vos finances :
          </Text>
          
          <SettingItem
            icon="notifications-outline"
            title="Notifications Activées/Désactivées"
            description="Activez ou désactivez les notifications selon vos préférences."
          />
          
          <SettingItem
            icon="time-outline"
            title="Fréquence des Notifications"
            description="Choisissez la fréquence : Quotidienne, Hebdomadaire, Mensuelle ou Annuelle."
          />
          
          <SettingItem
            icon="alarm-outline"
            title="Heure de Notification"
            description="Définissez l'heure à laquelle vous souhaitez recevoir vos notifications de rappel."
          />
        </Section>

        {/* Support et Assistance */}
        <Section title="Support et Assistance">
          <Text style={[styles.sectionText, { color: theme.text }]}>
            Si vous rencontrez des problèmes ou avez des questions :
          </Text>
          
          <View style={styles.supportContainer}>
            <Text style={[styles.supportItem, { color: theme.text }]}>- Vérifiez que votre application est à jour</Text>
            <Text style={[styles.supportItem, { color: theme.text }]}>- Redémarrez l&apos;application si nécessaire</Text>
            <Text style={[styles.supportItem, { color: theme.text }]}>- Contactez le support technique pour toute assistance</Text>
          </View>
          
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>
            Version de l&apos;application : 1.0.0
          </Text>
        </Section>

        {/* Bouton de retour */}
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.primary }]}
          onPress={handleBackPress}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Retour à la Configuration</Text>
        </TouchableOpacity>
      </ScrollView>
    </DashboardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  
  section: {
    marginBottom: 24,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  
  introText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "justify",
  },
  
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  
  featureContent: {
    flex: 1,
  },
  
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  
  tabsContainer: {
    gap: 8,
  },
  
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  
  settingContent: {
    flex: 1,
  },
  
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  
  noteText: {
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 8,
    padding: 12,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 8,
  },
  
  supportContainer: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  
  supportItem: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  
  versionText: {
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});