import { motion } from "framer-motion";
import { 
  Plane, 
  Home, 
  Bike, 
  Mountain,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CarbonResultsProps {
  results: {
    transport: number;
    accommodation: number;
    mobility: number;
    activities: number;
    total: number;
  };
  onReset: () => void;
}

const CarbonResults = ({ results, onReset }: CarbonResultsProps) => {
  const categories = [
    { 
      key: "transport", 
      label: "Transport", 
      icon: Plane, 
      value: results.transport,
      color: "bg-secondary",
      percentage: Math.round((results.transport / results.total) * 100) || 0
    },
    { 
      key: "accommodation", 
      label: "Hébergement", 
      icon: Home, 
      value: results.accommodation,
      color: "bg-primary-glow",
      percentage: Math.round((results.accommodation / results.total) * 100) || 0
    },
    { 
      key: "mobility", 
      label: "Mobilité", 
      icon: Bike, 
      value: results.mobility,
      color: "bg-accent",
      percentage: Math.round((results.mobility / results.total) * 100) || 0
    },
    { 
      key: "activities", 
      label: "Activités", 
      icon: Mountain, 
      value: results.activities,
      color: "bg-carbon-offset",
      percentage: Math.round((results.activities / results.total) * 100) || 0
    },
  ];

  // Score calculation based on total CO2
  const getScore = (total: number) => {
    if (total < 200) return { grade: "A+", label: "Exemplaire", color: "text-carbon-saved", bgColor: "bg-carbon-saved/20" };
    if (total < 400) return { grade: "A", label: "Excellent", color: "text-carbon-saved", bgColor: "bg-carbon-saved/20" };
    if (total < 600) return { grade: "B+", label: "Très bien", color: "text-carbon-offset", bgColor: "bg-carbon-offset/20" };
    if (total < 800) return { grade: "B", label: "Bien", color: "text-carbon-offset", bgColor: "bg-carbon-offset/20" };
    if (total < 1000) return { grade: "C", label: "Moyen", color: "text-yellow-500", bgColor: "bg-yellow-500/20" };
    if (total < 1500) return { grade: "D", label: "À améliorer", color: "text-secondary", bgColor: "bg-secondary/20" };
    return { grade: "E", label: "Élevé", color: "text-destructive", bgColor: "bg-destructive/20" };
  };

  const score = getScore(results.total);
  const averageTrip = 800; // Average kgCO2 for similar trip
  const comparison = Math.round(((results.total - averageTrip) / averageTrip) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden"
    >
      {/* Header with Score */}
      <div className="bg-gradient-to-r from-carbon to-carbon/80 text-carbon-foreground p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Votre empreinte carbone</h2>
            <p className="text-carbon-foreground/70">Résultat de votre estimation de séjour</p>
          </div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className={cn("text-center px-8 py-6 rounded-2xl", score.bgColor)}
          >
            <p className={cn("text-5xl font-bold", score.color)}>{score.grade}</p>
            <p className="text-sm text-carbon-foreground/70 mt-1">{score.label}</p>
          </motion.div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Total Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-8"
        >
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
            Émissions totales estimées
          </p>
          <p className="text-6xl md:text-7xl font-bold text-foreground mb-2">
            {results.total}
            <span className="text-2xl md:text-3xl text-muted-foreground ml-2">kgCO₂e</span>
          </p>
          
          {/* Comparison Badge */}
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mt-4",
            comparison < 0 ? "bg-carbon-saved/10 text-carbon-saved" : "bg-secondary/10 text-secondary"
          )}>
            {comparison < 0 ? (
              <>
                <TrendingDown className="w-4 h-4" />
                {Math.abs(comparison)}% en dessous de la moyenne
              </>
            ) : comparison > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                {comparison}% au-dessus de la moyenne
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Dans la moyenne
              </>
            )}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Détail par poste</h3>
          
          <div className="space-y-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", category.color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{category.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.value} kgCO₂e ({category.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                        className={cn("h-full rounded-full", category.color)}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chart Visual */}
        <div className="bg-muted/50 rounded-2xl p-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">Répartition visuelle</h4>
          <div className="flex items-end justify-center gap-4 h-40">
            {categories.map((category, index) => (
              <motion.div
                key={category.key}
                initial={{ height: 0 }}
                animate={{ height: `${(category.value / results.total) * 100}%` }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                className={cn("w-16 rounded-t-lg", category.color)}
                style={{ minHeight: category.value > 0 ? "20px" : "0" }}
              />
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {categories.map((category) => (
              <div key={category.key} className="flex items-center gap-2 text-xs">
                <div className={cn("w-3 h-3 rounded-full", category.color)} />
                <span className="text-muted-foreground">{category.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onReset} className="gap-2 flex-1">
            <RefreshCw className="w-4 h-4" />
            Nouvelle estimation
          </Button>
          <Button variant="ghost" className="gap-2">
            <Share2 className="w-4 h-4" />
            Partager
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CarbonResults;
